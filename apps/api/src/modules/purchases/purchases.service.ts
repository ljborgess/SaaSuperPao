import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/core'
import { Purchase, PurchaseItem, Ingredient, Supplier, StockMovement, User, PurchaseStatus, MovementType, MovementReason } from '@superpao/database'
import type { CreatePurchaseDto, PaginationQuery } from '@superpao/shared-types'
import { parsePagination, buildPaginatedResponse } from '@superpao/shared-utils'

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase) private readonly purchaseRepo: EntityRepository<Purchase>,
    @InjectRepository(PurchaseItem) private readonly itemRepo: EntityRepository<PurchaseItem>,
    @InjectRepository(Ingredient) private readonly ingredientRepo: EntityRepository<Ingredient>,
    @InjectRepository(Supplier) private readonly supplierRepo: EntityRepository<Supplier>,
    @InjectRepository(StockMovement) private readonly movementRepo: EntityRepository<StockMovement>,
    @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
  ) {}

  async findAll(query: PaginationQuery) {
    const { page, limit, offset } = parsePagination(query)
    const [data, total] = await this.purchaseRepo.findAndCount({}, {
      limit,
      offset,
      orderBy: { createdAt: 'DESC' },
      populate: ['supplier', 'items', 'items.ingredient'],
    })
    return buildPaginatedResponse(data, total, page, limit)
  }

  async findOne(id: string): Promise<Purchase> {
    const purchase = await this.purchaseRepo.findOne(id, {
      populate: ['supplier', 'items', 'items.ingredient'],
    })
    if (!purchase) throw new NotFoundException('Compra não encontrada.')
    return purchase
  }

  async create(dto: CreatePurchaseDto, createdById: string): Promise<Purchase> {
    const em = this.purchaseRepo.getEntityManager()

    const supplier = await this.supplierRepo.findOne(dto.supplierId)
    if (!supplier) throw new NotFoundException('Fornecedor não encontrado.')

    const createdBy = await this.userRepo.findOne(createdById)
    if (!createdBy) throw new NotFoundException('Usuário não encontrado.')

    let totalValue = 0
    const purchaseItems: PurchaseItem[] = []
    const movements: StockMovement[] = []

    for (const itemDto of dto.items) {
      const ingredient = await this.ingredientRepo.findOne(itemDto.ingredientId)
      if (!ingredient) throw new NotFoundException(`Ingrediente ${itemDto.ingredientId} não encontrado.`)

      const totalPrice = Number((itemDto.quantity * itemDto.unitPrice).toFixed(2))
      totalValue += totalPrice

      const item = this.itemRepo.create({
        ingredient,
        quantity: itemDto.quantity,
        unitPrice: itemDto.unitPrice,
        totalPrice,
      } as any)
      purchaseItems.push(item)
    }

    const purchase = this.purchaseRepo.create({
      supplier,
      createdBy,
      totalValue: Number(totalValue.toFixed(2)),
      purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : new Date(),
      invoiceNumber: dto.invoiceNumber,
      status: PurchaseStatus.PENDING,
      notes: dto.notes,
      items: purchaseItems,
    } as any)

    await em.persistAndFlush([purchase, ...purchaseItems])
    return purchase
  }

  async receive(id: string): Promise<Purchase> {
    const purchase = await this.findOne(id)
    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new BadRequestException('Apenas compras pendentes podem ser recebidas.')
    }

    const em = this.purchaseRepo.getEntityManager()
    purchase.status = PurchaseStatus.RECEIVED

    const movements: StockMovement[] = []

    for (const item of purchase.items) {
      const ingredient = item.ingredient
      const previousStock = ingredient.currentStock
      const newStock = previousStock + item.quantity
      ingredient.currentStock = newStock

      const movement = this.movementRepo.create({
        type: MovementType.IN,
        quantity: item.quantity,
        previousStock,
        newStock,
        reason: MovementReason.PURCHASE,
        ingredient,
      } as any)
      movements.push(movement)
    }

    await em.persistAndFlush([purchase, ...movements])
    return purchase
  }

  async remove(id: string): Promise<void> {
    const purchase = await this.findOne(id)
    if (purchase.status === PurchaseStatus.RECEIVED) {
      throw new BadRequestException('Não é possível remover uma compra já recebida.')
    }
    await this.purchaseRepo.getEntityManager().removeAndFlush(purchase)
  }
}
