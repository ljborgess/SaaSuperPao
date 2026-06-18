import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { User, UserRole } from '../entities/user.entity'

export class AdminSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const existing = await em.findOne(User, { email: 'admin@superpao.com.br' })
    if (existing) return

    const admin = em.create(User, {
      name: 'Administrador',
      email: 'admin@superpao.com.br',
      password: 'Admin@123',
      role: UserRole.ADMIN,
    } as any)
    await em.persistAndFlush(admin)
  }
}
