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
  ProductionMode,
  MovementType,
  MovementReason,
} from '@superpao/database'
import type {
  CreateProductionOrderDto,
  UpdateConsumptionDto,
  UpdateProductionOrderDto,
  ProductionVarianceDto,
  PaginationQuery,
} from '@superpao/shared-types'
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
      mode: dto.mode ?? ProductionMode.AUTOMATIC,
      scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : new Date(),
      notes: dto.notes,
      items: orderItems,
    } as any)

    await em.persistAndFlush([order, ...orderItems])
    return order
  }

  async update(id: string, dto: UpdateProductionOrderDto): Promise<ProductionOrder> {
    const order = await this.findOne(id)
    if (order.status === ProductionStatus.COMPLETED || order.status === ProductionStatus.CANCELLED) {
      throw new BadRequestException('Não é possível editar uma ordem já concluída ou cancelada.')
    }
    if (dto.scheduledDate) order.scheduledDate = new Date(dto.scheduledDate)
    if (dto.notes !== undefined) order.notes = dto.notes
    await this.orderRepo.getEntityManager().flush()
    return order
  }

  async updateConsumption(id: string, dto: UpdateConsumptionDto): Promise<ProductionOrder> {
    const order = await this.findOne(id)

    if (order.mode !== ProductionMode.MANUAL) {
      throw new BadRequestException('Consumo manual só pode ser registrado em ordens com modo MANUAL.')
    }

    if (order.status === ProductionStatus.COMPLETED || order.status === ProductionStatus.CANCELLED) {
      throw new BadRequestException('Não é possível alterar consumo de uma ordem já concluída ou cancelada.')
    }

    const em = this.orderRepo.getEntityManager()

    for (const input of dto.items) {
      if (input.consumedQty <= 0) {
        throw new BadRequestException(`Quantidade consumida deve ser maior que zero.`)
      }

      const orderItem = order.items
        .getItems()
        .find((i) => i.ingredient.id === input.ingredientId)

      if (!orderItem) {
        throw new BadRequestException(
          `Ingrediente com id "${input.ingredientId}" não pertence a esta ordem de produção.`,
        )
      }

      orderItem.consumedQty = input.consumedQty
    }

    await em.flush()
    return order
  }

  async complete(id: string, userId: string): Promise<ProductionOrder> {
    const order = await this.findOne(id)
    if (order.status !== ProductionStatus.IN_PROGRESS && order.status !== ProductionStatus.PENDING) {
      throw new BadRequestException('Apenas ordens planejadas ou em andamento podem ser concluídas.')
    }

    if (order.mode === ProductionMode.MANUAL) {
      const unfilledItem = order.items.getItems().find((i) => i.consumedQty == null)
      if (unfilledItem) {
        throw new BadRequestException(
          `Modo manual: informe o consumo real de todos os ingredientes antes de concluir. Ingrediente pendente: "${unfilledItem.ingredient.name}".`,
        )
      }
    }

    const createdBy = await this.userRepo.findOne(userId)
    if (!createdBy) throw new NotFoundException('Usuário não encontrado.')

    const em = this.orderRepo.getEntityManager()
    order.status = ProductionStatus.COMPLETED
    order.completedAt = new Date()

    const movements: StockMovement[] = []

    for (const item of order.items) {
      const ingredient = item.ingredient
      const previousStock = Number(ingredient.currentStock)
      const consumed = Number(order.mode === ProductionMode.MANUAL ? item.consumedQty! : item.requiredQty)
      const newStock = previousStock - consumed

      if (newStock < 0) {
        throw new BadRequestException(`Estoque insuficiente para ingrediente: ${ingredient.name}`)
      }

      ingredient.currentStock = newStock
      const movement = this.movementRepo.create({
        type: MovementType.OUT,
        quantity: consumed,
        previousStock,
        newStock,
        reason: MovementReason.PRODUCTION,
        ingredient,
        createdBy,
        referenceId: order.id,
        referenceType: 'PRODUCTION',
      } as any)
      movements.push(movement)
    }

    const product = order.product
    const prevProductStock = Number(product.currentStock)
    const newProductStock = prevProductStock + Number(order.quantity)
    product.currentStock = newProductStock

    const productMovement = this.movementRepo.create({
      type: MovementType.IN,
      quantity: Number(order.quantity),
      previousStock: prevProductStock,
      newStock: newProductStock,
      reason: MovementReason.PRODUCTION,
      product,
      createdBy,
      referenceId: order.id,
      referenceType: 'PRODUCTION',
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

  async getVariance(id: string): Promise<ProductionVarianceDto> {
    const order = await this.findOne(id)

    if (order.status !== ProductionStatus.COMPLETED) {
      throw new BadRequestException('Variância só está disponível para ordens concluídas.')
    }

    let totalVarianceCost = 0

    const items = order.items.getItems().map((item) => {
      const required = Number(item.requiredQty)
      const consumed = item.consumedQty != null ? Number(item.consumedQty) : required
      const variance = Number((consumed - required).toFixed(4))
      const variancePct = required > 0 ? Number(((variance / required) * 100).toFixed(2)) : 0
      const costPrice = Number(item.ingredient.costPrice)
      const varianceCost = Number((variance * costPrice).toFixed(2))

      totalVarianceCost += varianceCost

      return {
        ingredientId: item.ingredient.id,
        ingredientName: item.ingredient.name,
        unit: item.ingredient.unit,
        requiredQty: required,
        consumedQty: consumed,
        variance,
        variancePct,
        costPrice,
        varianceCost,
      }
    })

    return {
      orderId: order.id,
      mode: order.mode as 'AUTOMATIC' | 'MANUAL',
      items,
      totalVarianceCost: Number(totalVarianceCost.toFixed(2)),
    }
  }
}
