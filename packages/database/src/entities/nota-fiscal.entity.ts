import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'
import { Client } from './client.entity'
import { User } from './user.entity'

export enum NotaFiscalStatus {
  PENDING = 'PENDING',
  ISSUED = 'ISSUED',
  CANCELLED = 'CANCELLED',
  ERROR = 'ERROR',
}

@Entity({ tableName: 'notas_fiscais' })
export class NotaFiscal {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid()

  @ManyToOne(() => Client, { nullable: true })
  client?: Client

  @Property()
  clientName!: string

  @Property({ nullable: true })
  clientCpfCnpj?: string

  @Property({ nullable: true })
  clientEmail?: string

  @Property({ type: 'text' })
  serviceDescription!: string

  @Property({ nullable: true })
  serviceCode?: string

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  value!: number

  @Enum(() => NotaFiscalStatus)
  status: NotaFiscalStatus = NotaFiscalStatus.PENDING

  @Property({ nullable: true })
  externalId?: string

  @Property({ nullable: true })
  nfseNumber?: string

  @Property({ nullable: true, type: 'text' })
  errorMessage?: string

  @ManyToOne(() => User)
  createdBy!: User

  @Property({ nullable: true })
  issuedAt?: Date

  @Property({ nullable: true })
  cancelledAt?: Date

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}
