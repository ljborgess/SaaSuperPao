import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/core'
import { AuditLog, AuditAction } from '@superpao/database'
import type { PaginationQuery } from '@superpao/shared-types'
import { parsePagination, buildPaginatedResponse } from '@superpao/shared-utils'

export interface LogParams {
  userId: string
  action: AuditAction
  entity: string
  entityId?: string
  payload?: Record<string, unknown>
  ip?: string
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private readonly repo: EntityRepository<AuditLog>,
  ) {}

  async log(params: LogParams): Promise<void> {
    const { userId, action, entity, entityId, payload, ip } = params
    const log = this.repo.create({
      userId,
      action,
      entity,
      entityId,
      payload,
      ip,
    } as any)
    await this.repo.getEntityManager().persistAndFlush(log)
  }

  async findAll(query: PaginationQuery) {
    const { page, limit, offset } = parsePagination(query)
    const [data, total] = await this.repo.findAndCount({}, {
      limit,
      offset,
      orderBy: { createdAt: 'DESC' },
    })
    return buildPaginatedResponse(data, total, page, limit)
  }
}
