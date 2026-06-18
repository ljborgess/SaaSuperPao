import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'
import { Product } from './product.entity'
import { Recipe } from './recipe.entity'
import { User } from './user.entity'
import { ProductionOrderItem } from './production-order-item.entity'

export enum ProductionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity({ tableName: 'production_orders' })
export class ProductionOrder {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid()

  @ManyToOne(() => Product)
  product!: Product

  @ManyToOne(() => Recipe)
  recipe!: Recipe

  @Property({ type: 'decimal', precision: 10, scale: 3 })
  quantity!: number

  @Property()
  scheduledDate: Date = new Date()

  @Property({ nullable: true })
  completedAt?: Date

  @ManyToOne(() => User)
  responsible!: User

  @Enum(() => ProductionStatus)
  status: ProductionStatus = ProductionStatus.PENDING

  @Property({ nullable: true, type: 'text' })
  notes?: string

  @OneToMany(() => ProductionOrderItem, (poi) => poi.order, { orphanRemoval: true })
  items = new Collection<ProductionOrderItem>(this)

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}
