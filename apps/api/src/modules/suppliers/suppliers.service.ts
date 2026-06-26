import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/core'
import { Supplier } from '@superpao/database'
import type { CreateSupplierDto, UpdateSupplierDto, PaginationQuery } from '@superpao/shared-types'
import { parsePagination, buildPaginatedResponse } from '@superpao/shared-utils'

@Injectable()
export class SuppliersService {
  constructor(@InjectRepository(Supplier) private readonly repo: EntityRepository<Supplier>) {}

  async findAll(query: PaginationQuery) {
    const { page, limit, offset } = parsePagination(query)
    const where: Record<string, unknown> = {}
    if (query.search) where.razaoSocial = { $like: `%${query.search}%` }
    const [data, total] = await this.repo.findAndCount(where, {
      limit,
      offset,
      orderBy: { razaoSocial: 'ASC' },
    })
    return buildPaginatedResponse(data, total, page, limit)
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.repo.findOne(id)
    if (!supplier) throw new NotFoundException('Fornecedor não encontrado.')
    return supplier
  }

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.repo.create(dto as any)
    await this.repo.getEntityManager().persistAndFlush(supplier)
    return supplier
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findOne(id)
    Object.assign(supplier, dto)
    await this.repo.getEntityManager().flush()
    return supplier
  }

  async remove(id: string): Promise<void> {
    const supplier = await this.findOne(id)
    supplier.deletedAt = new Date()
    await this.repo.getEntityManager().flush()
  }
}
