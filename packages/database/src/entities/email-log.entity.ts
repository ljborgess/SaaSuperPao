import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'

export enum EmailStatus {
  SENT = 'SENT',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

@Entity({ tableName: 'email_logs' })
export class EmailLog {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid()

  @Property()
  to!: string

  @Property()
  subject!: string

  @Property()
  template!: string

  @Enum(() => EmailStatus)
  status: EmailStatus = EmailStatus.PENDING

  @Property({ nullable: true, type: 'text' })
  error?: string

  @Property({ nullable: true })
  sentAt?: Date

  @Property()
  createdAt: Date = new Date()
}
