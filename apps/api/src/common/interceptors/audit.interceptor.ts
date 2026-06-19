import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable, tap, catchError, throwError } from 'rxjs'
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

    const persist = async (success: boolean) => {
      if (!action || !user?.id) return
      const entity = url.split('/')[2] ?? 'unknown'
      const log = this.em.create(AuditLog, {
        userId: user.id,
        action,
        entity,
        ip: ip ?? 'unknown',
        payload: { success },
      } as any)
      await this.em.persistAndFlush(log).catch(() => {})
    }

    return next.handle().pipe(
      tap(() => persist(true)),
      catchError((err) => {
        persist(false)
        return throwError(() => err)
      }),
    )
  }
}
