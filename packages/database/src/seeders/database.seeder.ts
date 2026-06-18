import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { AdminSeeder } from './admin.seeder'
import { CategoriesSeeder } from './categories.seeder'
import { FullDataSeeder } from './full-data.seeder'

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    await this.call(em, [AdminSeeder, CategoriesSeeder, FullDataSeeder])
  }
}
