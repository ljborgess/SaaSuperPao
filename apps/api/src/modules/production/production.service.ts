import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/core'
import {
  ProductionOrder,
  ProductionOrderItem,
  Product,
  Recipe,
  RecipeItem,
  Ingredient,
  StockMovement,
  User,
  ProductionStatus,
  MovementType,
  MovementReason,
} from '@superpao/database'
import type { CreateProductionOrderDto, PaginationQuery } from '@superpao/shared-types'
import { parsePagination, buildPaginatedResponse } from '@superpao/shared-utils'

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(ProductionOrder) private readonly orderRepo: EntityRepository<ProductionOrder>,
    @InjectRepository(ProductionOrderItem) private readonly orderItemRepo: EntityRepository<ProductionOrderItem>,
    @InjectRepository(Product) private readonly productRepo: EntityRepository<Product>,
    @InjectRepository(Recipe) private readonly recipeRepo: EntityRepository<Recipe>,
    @InjectRepository(RecipeItem) private readonly recipeItemRepo: EntityRepository<RecipeItem>,
    @InjectRepository(Ingredient) private readonly ingredientRepo: EntityRepository<Ingredient>,
    @InjectRepository(StockMovement) private readonly movementRepo: EntityRepository<StockMovement>,
    @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
  ) {}

  async findAll(query: PaginationQuery) {
    const { page, limit, offset } = parsePagination(query)
    const [data, total] = await this.orderRepo.findAndCount({}, {
      limit,
      offset,
      orderBy: { createdAt: 'DESC' },
      populate: ['product', 'items', 'items.ingredient'],
    })
    return buildPaginatedResponse(data, total, page, limit)
  }

  async findOne(id: string): Promise<ProductionOrder> {
    const order = await this.orderRepo.findOne(id, {
      populate: ['product', 'items', 'items.ingredient'],
    })
    if (!order) throw new NotFoundException('Ordem de produção não encontrada.')
    return order
  }

  async create(dto: CreateProductionOrderDto): Promise<ProductionOrder> {
    const em = this.orderRepo.getEntityManager()

    const product = await this.productRepo.findOne(dto.productId)
    if (!product) throw new NotFoundException('Produto não encontrado.')

    const responsible = await this.userRepo.findOne(dto.responsibleId)
    if (!responsible) throw new NotFoundException('Responsável não encontrado.')

    const recipe = await this.recipeRepo.findOne(
      { product },
      { populate: ['items', 'items.ingredient'] },
    )
    if (!recipe) throw new NotFoundException('Receita não encontrada para este produto.')

    const scaleFactor = dto.quantity / recipe.yieldQty
    const orderItems: ProductionOrderItem[] = []

    for (const recipeItem of recipe.items) {
      const scaledQty = Number((recipeItem.quantity * scaleFactor).toFixed(4))
      const item = this.orderItemRepo.create({
        ingredient: recipeItem.ingredient,
        requiredQty: scaledQty,
        unit: recipeItem.unit,
      } as any)
      orderItems.push(item)
    }

    const order = this.orderRepo.create({
      product,
      recipe,
      quantity: dto.quantity,
      responsible,
      status: ProductionStatus.PENDING,
      scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : new Date(),
      notes: dto.notes,
      items: orderItems,
    } as any)

    await em.persistAndFlush([order, ...orderItems])
    return order
  }

  async complete(id: string): Promise<ProductionOrder> {
    const order = await this.findOne(id)
    if (order.status !== ProductionStatus.IN_PROGRESS && order.status !== ProductionStatus.PENDING) {
      throw new BadRequestException('Apenas ordens planejadas ou em andamento podem ser concluídas.')
    }

    const em = this.orderRepo.getEntityManager()
    order.status = ProductionStatus.COMPLETED
    order.completedAt = new Date()

    const movements: StockMovement[] = []

    // Deduct ingredients (OUT)
    for (const item of order.items) {
      const ingredient = item.ingredient
      const previousStock = ingredient.currentStock
      const consumed = item.consumedQty ?? item.requiredQty
      const newStock = previousStock - consumed

      if (newStock < 0) throw new BadRequestException(`Estoque insuficiente para ingrediente: ${ingredient.name}`)

      ingredient.currentStock = newStock
      const movement = this.movementRepo.create({
        type: MovementType.OUT,
        quantity: consumed,
        previousStock,
        newStock,
        reason: MovementReason.PRODUCTION,
        ingredient,
      } as any)
      movements.push(movement)
    }

    // Add produced product (IN)
    const product = order.product
    const prevProductStock = product.currentStock
    const newProductStock = prevProductStock + order.quantity
    product.currentStock = newProductStock

    const productMovement = this.movementRepo.create({
      type: MovementType.IN,
      quantity: order.quantity,
      previousStock: prevProductStock,
      newStock: newProductStock,
      reason: MovementReason.PRODUCTION,
      product,
    } as any)
    movements.push(productMovement)

    await em.persistAndFlush([order, product, ...movements])
    return order
  }

  async cancel(id: string): Promise<ProductionOrder> {
    const order = await this.findOne(id)
    if (order.status === ProductionStatus.COMPLETED) {
      throw new BadRequestException('Não é possível cancelar uma ordem já concluída.')
    }
    order.status = ProductionStatus.CANCELLED
    await this.orderRepo.getEntityManager().flush()
    return order
  }
}
