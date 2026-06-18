import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'
import { Supplier } from './supplier.entity'
import { RecipeItem } from './recipe-item.entity'
import { PurchaseItem } from './purchase-item.entity'
import { StockMovement } from './stock-movement.entity'

export enum IngredientUnit {
  KG = 'KG',
  G = 'G',
  L = 'L',
  ML = 'ML',
  UN = 'UN',
  PCT = 'PCT',
  CX = 'CX',
}

@Entity({ tableName: 'ingredients' })
export class Ingredient {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid()

  @Property()
  name!: string

  @Enum(() => IngredientUnit)
  unit: IngredientUnit = IngredientUnit.KG

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costPrice: number = 0

  @Property({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  currentStock: number = 0

  @Property({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  minStock: number = 0

  @ManyToOne(() => Supplier, { nullable: true })
  supplier?: Supplier

  @Property()
  active: boolean = true

  @OneToMany(() => RecipeItem, (ri) => ri.ingredient)
  recipeItems = new Collection<RecipeItem>(this)

  @OneToMany(() => PurchaseItem, (pi) => pi.ingredient)
  purchaseItems = new Collection<PurchaseItem>(this)

  @OneToMany(() => StockMovement, (sm) => sm.ingredient)
  stockMovements = new Collection<StockMovement>(this)

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}
