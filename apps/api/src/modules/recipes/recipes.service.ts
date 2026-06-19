import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/core'
import { Recipe, RecipeItem, Product, Ingredient } from '@superpao/database'
import type { CreateRecipeDto, UpdateRecipeDto, UpdateRecipeItemDto, CreateRecipeItemDto } from '@superpao/shared-types'

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe) private readonly recipeRepo: EntityRepository<Recipe>,
    @InjectRepository(RecipeItem) private readonly itemRepo: EntityRepository<RecipeItem>,
    @InjectRepository(Product) private readonly productRepo: EntityRepository<Product>,
    @InjectRepository(Ingredient) private readonly ingredientRepo: EntityRepository<Ingredient>,
  ) {}

  async findByProduct(productId: string): Promise<Recipe | null> {
    const product = await this.productRepo.findOne(productId)
    if (!product) throw new NotFoundException('Produto não encontrado.')

    return this.recipeRepo.findOne(
      { product },
      { populate: ['items', 'items.ingredient'] },
    )
  }

  async create(dto: CreateRecipeDto): Promise<Recipe> {
    const em = this.recipeRepo.getEntityManager()

    const product = await this.productRepo.findOne(dto.productId)
    if (!product) throw new NotFoundException('Produto não encontrado.')

    const existing = await this.recipeRepo.findOne({ product })
    if (existing) throw new ConflictException('Este produto já possui uma receita. Use PATCH para atualizar.')

    const items: RecipeItem[] = []
    for (const itemDto of dto.items) {
      const ingredient = await this.ingredientRepo.findOne(itemDto.ingredientId)
      if (!ingredient) throw new NotFoundException(`Ingrediente "${itemDto.ingredientId}" não encontrado.`)
      items.push(this.itemRepo.create({ ingredient, quantity: itemDto.quantity, unit: itemDto.unit } as any))
    }

    const recipe = this.recipeRepo.create({
      product,
      yieldQty: dto.yieldQty,
      yieldUnit: dto.yieldUnit,
      instructions: dto.instructions,
      items,
    } as any)

    await em.persistAndFlush([recipe, ...items])
    return this.findByProduct(dto.productId) as Promise<Recipe>
  }

  async update(id: string, dto: UpdateRecipeDto): Promise<Recipe> {
    const recipe = await this.recipeRepo.findOne(id, { populate: ['items', 'items.ingredient'] })
    if (!recipe) throw new NotFoundException('Receita não encontrada.')

    if (dto.yieldQty !== undefined) recipe.yieldQty = dto.yieldQty
    if (dto.yieldUnit !== undefined) recipe.yieldUnit = dto.yieldUnit
    if (dto.instructions !== undefined) recipe.instructions = dto.instructions

    await this.recipeRepo.getEntityManager().flush()
    return recipe
  }

  async remove(id: string): Promise<void> {
    const recipe = await this.recipeRepo.findOne(id)
    if (!recipe) throw new NotFoundException('Receita não encontrada.')
    await this.recipeRepo.getEntityManager().removeAndFlush(recipe)
  }

  async addItem(recipeId: string, dto: CreateRecipeItemDto): Promise<Recipe> {
    const recipe = await this.recipeRepo.findOne(recipeId, { populate: ['items', 'items.ingredient'] })
    if (!recipe) throw new NotFoundException('Receita não encontrada.')

    const ingredient = await this.ingredientRepo.findOne(dto.ingredientId)
    if (!ingredient) throw new NotFoundException(`Ingrediente "${dto.ingredientId}" não encontrado.`)

    const item = this.itemRepo.create({ recipe, ingredient, quantity: dto.quantity, unit: dto.unit } as any)
    await this.recipeRepo.getEntityManager().persistAndFlush(item)

    return this.recipeRepo.findOne(recipeId, { populate: ['items', 'items.ingredient'] }) as Promise<Recipe>
  }

  async updateItem(recipeId: string, itemId: string, dto: UpdateRecipeItemDto): Promise<Recipe> {
    const recipe = await this.recipeRepo.findOne(recipeId)
    if (!recipe) throw new NotFoundException('Receita não encontrada.')

    const item = await this.itemRepo.findOne(itemId)
    if (!item) throw new NotFoundException('Item da receita não encontrado.')

    if (dto.quantity !== undefined) item.quantity = dto.quantity
    if (dto.unit !== undefined) item.unit = dto.unit

    await this.itemRepo.getEntityManager().flush()
    return this.recipeRepo.findOne(recipeId, { populate: ['items', 'items.ingredient'] }) as Promise<Recipe>
  }

  async removeItem(recipeId: string, itemId: string): Promise<Recipe> {
    const recipe = await this.recipeRepo.findOne(recipeId)
    if (!recipe) throw new NotFoundException('Receita não encontrada.')

    const item = await this.itemRepo.findOne(itemId)
    if (!item) throw new NotFoundException('Item da receita não encontrado.')

    await this.itemRepo.getEntityManager().removeAndFlush(item)
    return this.recipeRepo.findOne(recipeId, { populate: ['items', 'items.ingredient'] }) as Promise<Recipe>
  }
}
