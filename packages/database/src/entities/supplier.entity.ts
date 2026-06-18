import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'
import { Purchase } from './purchase.entity'
import { Ingredient } from './ingredient.entity'

@Entity({ tableName: 'suppliers' })
export class Supplier {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid()

  @Property()
  razaoSocial!: string

  @Property({ nullable: true })
  nomeFantasia?: string

  @Property({ nullable: true, unique: true })
  cnpj?: string

  @Property({ nullable: true })
  contact?: string

  @Property({ nullable: true })
  phone?: string

  @Property({ nullable: true })
  email?: string

  @Property({ nullable: true })
  address?: string

  @Property()
  active: boolean = true

  @OneToMany(() => Purchase, (p) => p.supplier)
  purchases = new Collection<Purchase>(this)

  @OneToMany(() => Ingredient, (i) => i.supplier)
  ingredients = new Collection<Ingredient>(this)

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}
