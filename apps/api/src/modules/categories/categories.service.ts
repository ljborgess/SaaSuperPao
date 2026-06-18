import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/core'
import { Category } from '@superpao/database'
import type { CreateCategoryDto, UpdateCategoryDto, PaginationQuery } from '@superpao/shared-types'
import { parsePagination, buildPaginatedResponse } from '@superpao/shared-utils'

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private readonly repo: EntityRepository<Category>) {}

  async findAll(query: PaginationQuery) {
    const { page, limit, offset } = parsePagination(query)
    const where: Record<string, unknown> = {}
    if (query.search) where.name = { $like: `%${query.search}%` }
    const [data, total] = await this.repo.findAndCount(where, {
      limit,
      offset,
      orderBy: { name: 'ASC' },
    })
    return buildPaginatedResponse(data, total, page, limit)
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.repo.findOne(id)
    if (!category) throw new NotFoundException('Categoria não encontrada.')
    return category
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const category = this.repo.create(dto as any)
    await this.repo.getEntityManager().persistAndFlush(category)
    return category
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id)
    Object.assign(category, dto)
    await this.repo.getEntityManager().flush()
    return category
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id)
    await this.repo.getEntityManager().removeAndFlush(category)
  }
}
