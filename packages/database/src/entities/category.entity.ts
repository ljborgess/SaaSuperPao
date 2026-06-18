import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'
import { Product } from './product.entity'

@Entity({ tableName: 'categories' })
export class Category {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid()

  @Property({ unique: true })
  name!: string

  @Property({ nullable: true })
  description?: string

  @OneToMany(() => Product, (p) => p.category)
  products = new Collection<Product>(this)

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}
