import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/core'
import { Product, Category } from '@superpao/database'
import type { CreateProductDto, UpdateProductDto, PaginationQuery } from '@superpao/shared-types'
import { parsePagination, buildPaginatedResponse } from '@superpao/shared-utils'

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly repo: EntityRepository<Product>,
    @InjectRepository(Category) private readonly categoryRepo: EntityRepository<Category>,
  ) {}

  async findAll(query: PaginationQuery) {
    const { page, limit, offset } = parsePagination(query)
    const where: Record<string, unknown> = {}
    if (query.search) where.name = { $like: `%${query.search}%` }
    const [data, total] = await this.repo.findAndCount(where, {
      limit,
      offset,
      orderBy: { name: 'ASC' },
      populate: ['category'],
    })
    return buildPaginatedResponse(data, total, page, limit)
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.repo.findOne(id, { populate: ['category'] })
    if (!product) throw new NotFoundException('Produto não encontrado.')
    return product
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const { categoryId, costPrice, salePrice, ...rest } = dto as CreateProductDto & {
      categoryId?: string
      costPrice: number
      salePrice: number
    }

    let category: Category | null = null
    if (categoryId) {
      category = await this.categoryRepo.findOne(categoryId)
      if (!category) throw new NotFoundException('Categoria não encontrada.')
    }

    const margin = salePrice > 0 && costPrice >= 0
      ? Number((((salePrice - costPrice) / salePrice) * 100).toFixed(2))
      : 0

    const product = this.repo.create({ ...rest, costPrice, salePrice, margin, category } as any)
    await this.repo.getEntityManager().persistAndFlush(product)
    return product
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id)
    const { categoryId, costPrice, salePrice, ...rest } = dto as UpdateProductDto & {
      categoryId?: string
      costPrice?: number
      salePrice?: number
    }

    if (categoryId) {
      const category = await this.categoryRepo.findOne(categoryId)
      if (!category) throw new NotFoundException('Categoria não encontrada.')
      product.category = category
    }

    const newCost = costPrice ?? product.costPrice
    const newSale = salePrice ?? product.salePrice
    const margin = newSale > 0 && newCost >= 0
      ? Number((((newSale - newCost) / newSale) * 100).toFixed(2))
      : product.margin

    Object.assign(product, { ...rest, costPrice: newCost, salePrice: newSale, margin })
    await this.repo.getEntityManager().flush()
    return product
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id)
    await this.repo.getEntityManager().removeAndFlush(product)
  }
}
