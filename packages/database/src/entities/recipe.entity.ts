import { Entity, PrimaryKey, Property, OneToOne, OneToMany, Collection } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'
import { Product } from './product.entity'
import { RecipeItem } from './recipe-item.entity'

@Entity({ tableName: 'recipes' })
export class Recipe {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid()

  @OneToOne(() => Product)
  product!: Product

  @Property({ type: 'decimal', precision: 10, scale: 3 })
  yieldQty!: number

  @Property()
  yieldUnit!: string

  @Property({ nullable: true, type: 'text' })
  instructions?: string

  @OneToMany(() => RecipeItem, (ri) => ri.recipe, { orphanRemoval: true, eager: true })
  items = new Collection<RecipeItem>(this)

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}
