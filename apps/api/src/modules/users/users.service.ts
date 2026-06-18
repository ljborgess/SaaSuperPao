import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/core'
import { User } from '@superpao/database'
import type { CreateUserDto, UpdateUserDto, PaginationQuery } from '@superpao/shared-types'
import { parsePagination, buildPaginatedResponse } from '@superpao/shared-utils'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: EntityRepository<User>) {}

  async findAll(query: PaginationQuery) {
    const { page, limit, offset } = parsePagination(query)
    const where = query.search
      ? { $or: [{ name: { $ilike: `%${query.search}%` } }, { email: { $ilike: `%${query.search}%` } }] }
      : {}
    const [data, total] = await this.repo.findAndCount(where, {
      limit,
      offset,
      orderBy: { createdAt: 'DESC' },
    })
    return buildPaginatedResponse(data, total, page, limit)
  }

  async findOne(id: string): Promise<User> {
    const user = await this.repo.findOne(id)
    if (!user) throw new NotFoundException('Usuário não encontrado.')
    return user
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.repo.findOne({ email: dto.email })
    if (existing) throw new ConflictException('E-mail já cadastrado.')
    const user = this.repo.create(dto as any)
    await this.repo.getEntityManager().persistAndFlush(user)
    return user
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id)
    if (dto.email && dto.email !== user.email) {
      const conflict = await this.repo.findOne({ email: dto.email })
      if (conflict) throw new ConflictException('E-mail já cadastrado.')
    }
    Object.assign(user, dto)
    await this.repo.getEntityManager().flush()
    return user
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id)
    await this.repo.getEntityManager().removeAndFlush(user)
  }
}
