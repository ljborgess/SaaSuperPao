import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'
import { Recipe } from './recipe.entity'
import { Ingredient } from './ingredient.entity'

@Entity({ tableName: 'recipe_items' })
export class RecipeItem {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid()

  @ManyToOne(() => Recipe)
  recipe!: Recipe

  @ManyToOne(() => Ingredient)
  ingredient!: Ingredient

  @Property({ type: 'decimal', precision: 10, scale: 4 })
  quantity!: number

  @Property()
  unit!: string

  @Property()
  createdAt: Date = new Date()
}
