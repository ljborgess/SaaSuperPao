import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'
import { Purchase } from './purchase.entity'
import { Ingredient } from './ingredient.entity'

@Entity({ tableName: 'purchase_items' })
export class PurchaseItem {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid()

  @ManyToOne(() => Purchase)
  purchase!: Purchase

  @ManyToOne(() => Ingredient)
  ingredient!: Ingredient

  @Property({ type: 'decimal', precision: 10, scale: 3 })
  quantity!: number

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice!: number

  @Property()
  createdAt: Date = new Date()
}
