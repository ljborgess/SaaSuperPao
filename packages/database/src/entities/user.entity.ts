import { Entity, Filter, PrimaryKey, Property, Enum, BeforeCreate, BeforeUpdate } from '@mikro-orm/core'
import { v4 as uuid } from 'uuid'
import * as bcrypt from 'bcrypt'

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })
@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid()

  @Property()
  name!: string

  @Property({ unique: true })
  email!: string

  @Property({ hidden: true })
  password!: string

  @Enum(() => UserRole)
  role: UserRole = UserRole.OPERATOR

  @Enum(() => UserStatus)
  status: UserStatus = UserStatus.ACTIVE

  @Property({ nullable: true, type: 'text' })
  avatarUrl?: string

  @Property({ nullable: true, hidden: true })
  refreshToken?: string

  @Property({ nullable: true, hidden: true })
  passwordResetToken?: string

  @Property({ nullable: true, hidden: true })
  passwordResetExpires?: Date

  @Property({ default: 0 })
  loginAttempts: number = 0

  @Property({ nullable: true, hidden: true })
  lockedUntil?: Date

  @Property({ nullable: true })
  deletedAt?: Date

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  @BeforeCreate()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 12)
    }
  }

  async comparePassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.password)
  }
}
