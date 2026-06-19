import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/core'
import { StockMovement, Ingredient, Product, User, MovementType, MovementReason } from '@superpao/database'
import type { CreateIngredientDto, UpdateIngredientDto, CreateStockMovementDto, PaginationQuery } from '@superpao/shared-types'
import { parsePagination, buildPaginatedResponse } from '@superpao/shared-utils'

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(StockMovement) private readonly movementRepo: EntityRepository<StockMovement>,
    @InjectRepository(Ingredient) private readonly ingredientRepo: EntityRepository<Ingredient>,
    @InjectRepository(Product) private readonly productRepo: EntityRepository<Product>,
    @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
  ) {}

  async findAllIngredients(query: PaginationQuery) {
    const { page, limit, offset } = parsePagination(query)
    const where: Record<string, unknown> = {}
    if (query.search) where.name = { $like: `%${query.search}%` }
    const [data, total] = await this.ingredientRepo.findAndCount(where, {
      limit,
      offset,
      orderBy: { name: 'ASC' },
    })
    return buildPaginatedResponse(data, total, page, limit)
  }

  async findOneIngredient(id: string): Promise<Ingredient> {
    const ingredient = await this.ingredientRepo.findOne(id)
    if (!ingredient) throw new NotFoundException('Ingrediente não encontrado.')
    return ingredient
  }

  async createIngredient(dto: CreateIngredientDto): Promise<Ingredient> {
    const ingredient = this.ingredientRepo.create(dto as any)
    await this.ingredientRepo.getEntityManager().persistAndFlush(ingredient)
    return ingredient
  }

  async updateIngredient(id: string, dto: UpdateIngredientDto): Promise<Ingredient> {
    const ingredient = await this.findOneIngredient(id)
    Object.assign(ingredient, dto)
    await this.ingredientRepo.getEntityManager().flush()
    return ingredient
  }

  async removeIngredient(id: string): Promise<void> {
    const ingredient = await this.findOneIngredient(id)
    await this.ingredientRepo.getEntityManager().removeAndFlush(ingredient)
  }

  async findAllMovements(query: PaginationQuery) {
    const { page, limit, offset } = parsePagination(query)
    const [data, total] = await this.movementRepo.findAndCount({}, {
      limit,
      offset,
      orderBy: { createdAt: 'DESC' },
      populate: ['ingredient', 'product'],
    })
    return buildPaginatedResponse(data, total, page, limit)
  }

  async createMovement(dto: CreateStockMovementDto, userId: string): Promise<StockMovement> {
    const em = this.movementRepo.getEntityManager()

    const createdBy = await this.userRepo.findOne(userId)
    if (!createdBy) throw new NotFoundException('Usuário não encontrado.')

    let ingredient: Ingredient | null = null
    let product: Product | null = null
    let previousStock = 0

    if (dto.ingredientId) {
      ingredient = await this.ingredientRepo.findOne(dto.ingredientId)
      if (!ingredient) throw new NotFoundException('Ingrediente não encontrado.')
      previousStock = Number(ingredient.currentStock)
    } else if (dto.productId) {
      product = await this.productRepo.findOne(dto.productId)
      if (!product) throw new NotFoundException('Produto não encontrado.')
      previousStock = Number(product.currentStock)
    } else {
      throw new BadRequestException('Informe ingredientId ou productId.')
    }

    const qty = Number(dto.quantity)
    const newStock = dto.type === MovementType.OUT
      ? previousStock - qty
      : previousStock + qty

    if (newStock < 0) throw new BadRequestException('Estoque insuficiente.')

    if (ingredient) ingredient.currentStock = newStock
    if (product) product.currentStock = newStock

    const movement = this.movementRepo.create({
      type: dto.type as unknown as MovementType,
      quantity: qty,
      previousStock,
      newStock,
      reason: dto.reason as unknown as MovementReason,
      ingredient,
      product,
      createdBy,
    } as any)

    await em.persistAndFlush([...(ingredient ? [ingredient] : []), ...(product ? [product] : []), movement])
    return movement
  }
}
