import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'

@Entity({ tableName: 'clients' })
export class Client {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid()

  @Property()
  name!: string

  @Property({ nullable: true, unique: true })
  cpfCnpj?: string

  @Property({ nullable: true })
  phone?: string

  @Property({ nullable: true })
  whatsapp?: string

  @Property({ nullable: true })
  email?: string

  @Property({ nullable: true })
  address?: string

  @Property()
  active: boolean = true

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()
}
