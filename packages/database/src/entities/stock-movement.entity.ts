import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'
import { User } from './user.entity'
import { Ingredient } from './ingredient.entity'
import { Product } from './product.entity'

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
}

export enum MovementReason {
  PURCHASE = 'PURCHASE',
  PRODUCTION = 'PRODUCTION',
  SALE = 'SALE',
  LOSS = 'LOSS',
  INTERNAL_USE = 'INTERNAL_USE',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
  INITIAL_STOCK = 'INITIAL_STOCK',
}

@Entity({ tableName: 'stock_movements' })
export class StockMovement {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid()

  @Enum(() => MovementType)
  type!: MovementType

  @Enum(() => MovementReason)
  reason!: MovementReason

  @ManyToOne(() => Ingredient, { nullable: true })
  ingredient?: Ingredient

  @ManyToOne(() => Product, { nullable: true })
  product?: Product

  @Property({ type: 'decimal', precision: 10, scale: 4 })
  quantity!: number

  @Property({ type: 'decimal', precision: 10, scale: 4 })
  previousStock!: number

  @Property({ type: 'decimal', precision: 10, scale: 4 })
  newStock!: number

  @ManyToOne(() => User)
  createdBy!: User

  @Property({ nullable: true })
  referenceId?: string

  @Property({ nullable: true })
  referenceType?: string

  @Property({ nullable: true, type: 'text' })
  notes?: string

  @Property()
  createdAt: Date = new Date()
}
