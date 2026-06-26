import { Entity, Filter, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'
import { Category } from './category.entity'

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum ProductUnit {
  UN = 'UN',
  KG = 'KG',
  G = 'G',
  L = 'L',
  ML = 'ML',
  CX = 'CX',
  PCT = 'PCT',
}

@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })
@Entity({ tableName: 'products' })
export class Product {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid()

  @Property()
  name!: string

  @Property({ unique: true })
  code!: string

  @ManyToOne(() => Category, { nullable: true })
  category?: Category

  @Enum(() => ProductUnit)
  unit: ProductUnit = ProductUnit.UN

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costPrice: number = 0

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  salePrice: number = 0

  @Property({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  margin: number = 0

  @Property({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  currentStock: number = 0

  @Property({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  minStock: number = 0

  @Enum(() => ProductStatus)
  status: ProductStatus = ProductStatus.ACTIVE

  @Property({ nullable: true })
  deletedAt?: Date

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}
