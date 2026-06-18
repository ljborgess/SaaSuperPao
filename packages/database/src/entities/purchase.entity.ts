import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'
import { Supplier } from './supplier.entity'
import { User } from './user.entity'
import { PurchaseItem } from './purchase-item.entity'

export enum PurchaseStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

@Entity({ tableName: 'purchases' })
export class Purchase {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid()

  @ManyToOne(() => Supplier)
  supplier!: Supplier

  @ManyToOne(() => User)
  createdBy!: User

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalValue: number = 0

  @Property()
  purchaseDate: Date = new Date()

  @Enum(() => PurchaseStatus)
  status: PurchaseStatus = PurchaseStatus.PENDING

  @Property({ nullable: true })
  invoiceNumber?: string

  @Property({ nullable: true, type: 'text' })
  notes?: string

  @OneToMany(() => PurchaseItem, (pi) => pi.purchase, { orphanRemoval: true, eager: true })
  items = new Collection<PurchaseItem>(this)

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}
