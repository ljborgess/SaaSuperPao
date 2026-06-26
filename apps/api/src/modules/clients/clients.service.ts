import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/core'
import { Client } from '@superpao/database'
import type { CreateClientDto, UpdateClientDto, PaginationQuery } from '@superpao/shared-types'
import { parsePagination, buildPaginatedResponse } from '@superpao/shared-utils'

@Injectable()
export class ClientsService {
  constructor(@InjectRepository(Client) private readonly repo: EntityRepository<Client>) {}

  async findAll(query: PaginationQuery) {
    const { page, limit, offset } = parsePagination(query)
    const where: Record<string, unknown> = {}
    if (query.search) where.name = { $like: `%${query.search}%` }
    const [data, total] = await this.repo.findAndCount(where, { limit, offset, orderBy: { name: 'ASC' } })
    return buildPaginatedResponse(data, total, page, limit)
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.repo.findOne(id)
    if (!client) throw new NotFoundException('Cliente não encontrado.')
    return client
  }

  async create(dto: CreateClientDto): Promise<Client> {
    const client = this.repo.create(dto as any)
    await this.repo.getEntityManager().persistAndFlush(client)
    return client
  }

  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id)
    Object.assign(client, dto)
    await this.repo.getEntityManager().flush()
    return client
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id)
    client.deletedAt = new Date()
    await this.repo.getEntityManager().flush()
  }
}
