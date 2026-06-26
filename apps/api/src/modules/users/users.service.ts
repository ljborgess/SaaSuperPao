import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/core'
import { User, AuditAction } from '@superpao/database'
import { parsePagination, buildPaginatedResponse } from '@superpao/shared-utils'
import { AuditService } from '../audit/audit.service'
import type { CreateUserDto, UpdateUserDto, PaginationQuery } from '@superpao/shared-types'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: EntityRepository<User>,
    private readonly auditService: AuditService,
  ) {}

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

  async update(id: string, dto: UpdateUserDto, requesterId?: string): Promise<User> {
    const user = await this.findOne(id)
    if (dto.email && dto.email !== user.email) {
      const conflict = await this.repo.findOne({ email: dto.email })
      if (conflict) throw new ConflictException('E-mail já cadastrado.')
      user.email = dto.email
    }
    if (dto.name !== undefined) user.name = dto.name
    if (dto.role !== undefined) user.role = dto.role as any
    if (dto.status !== undefined) user.status = dto.status as any

    const passwordChanged = (dto as any).password !== undefined
    if (passwordChanged) {
      user.password = (dto as any).password
    }

    await this.repo.getEntityManager().flush()

    if (passwordChanged && requesterId) {
      await this.auditService.log({
        userId: requesterId,
        action: AuditAction.PASSWORD_CHANGE,
        entity: 'users',
        entityId: id,
        payload: { targetUserId: id },
      })
    }

    return user
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id)
    user.deletedAt = new Date()
    await this.repo.getEntityManager().flush()
  }
}
