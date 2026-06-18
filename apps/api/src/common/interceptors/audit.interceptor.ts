import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { EntityManager } from '@mikro-orm/core'
import { AuditLog, AuditAction } from '@superpao/database'

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly em: EntityManager) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest()
    const { method, url, user, ip } = req

    const action = method === 'POST' ? AuditAction.CREATE
      : method === 'PATCH' || method === 'PUT' ? AuditAction.UPDATE
      : method === 'DELETE' ? AuditAction.DELETE
      : null

    return next.handle().pipe(
      tap(async () => {
        if (!action || !user) return
        const entity = url.split('/')[2] ?? 'unknown'
        const log = this.em.create(AuditLog, { user, action, entity, ip } as any)
        await this.em.persistAndFlush(log)
      }),
    )
  }
}
