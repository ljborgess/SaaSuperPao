import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'
import { ProductionOrder } from './production-order.entity'
import { Ingredient } from './ingredient.entity'

@Entity({ tableName: 'production_order_items' })
export class ProductionOrderItem {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid()

  @ManyToOne(() => ProductionOrder)
  order!: ProductionOrder

  @ManyToOne(() => Ingredient)
  ingredient!: Ingredient

  @Property({ type: 'decimal', precision: 10, scale: 4 })
  requiredQty!: number

  @Property({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  consumedQty?: number

  @Property()
  createdAt: Date = new Date()
}
