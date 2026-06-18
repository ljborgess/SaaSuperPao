import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'
import { User } from './user.entity'

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  STOCK_MOVEMENT = 'STOCK_MOVEMENT',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

@Entity({ tableName: 'audit_logs' })
export class AuditLog {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid()

  @ManyToOne(() => User, { nullable: true })
  user?: User

  @Enum(() => AuditAction)
  action!: AuditAction

  @Property()
  entity!: string

  @Property({ nullable: true })
  entityId?: string

  @Property({ nullable: true, type: 'json' })
  payload?: Record<string, unknown>

  @Property({ nullable: true })
  ip?: string

  @Property()
  createdAt: Date = new Date()
}
