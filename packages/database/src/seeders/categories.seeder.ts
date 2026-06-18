import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { Category } from '../entities/category.entity'

const CATEGORIES = [
  { name: 'Pães', description: 'Pães artesanais, francês, integral, forma e similares' },
  { name: 'Bolos', description: 'Bolos confeitados, simples, recheados e tortas' },
  { name: 'Salgados', description: 'Coxinhas, esfirras, esfihas, pastéis e similares' },
  { name: 'Doces', description: 'Brigadeiros, trufas, bombons e confeitaria em geral' },
  { name: 'Tortas', description: 'Tortas doces e salgadas, quiches e empadas' },
  { name: 'Bebidas', description: 'Sucos, cafés, refrigerantes e vitaminas' },
  { name: 'Biscoitos e Cookies', description: 'Biscoitos artesanais, cookies e bolachas' },
  { name: 'Croissants e Folhados', description: 'Croissants, mil-folhas e massas folhadas' },
  { name: 'Brioches e Especiais', description: 'Pães especiais, ciabatta, focaccia e brioche' },
  { name: 'Frios e Laticínios', description: 'Queijos, frios, manteiga e produtos lácteos' },
]

export class CategoriesSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    for (const cat of CATEGORIES) {
      const existing = await em.findOne(Category, { name: cat.name })
      if (existing) continue

      const category = em.create(Category, cat as any)
      em.persist(category)
    }
    await em.flush()
  }
}
