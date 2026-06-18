import { defineConfig } from '@mikro-orm/postgresql'
import { Migrator } from '@mikro-orm/migrations'
import { SeedManager } from '@mikro-orm/seeder'
import { User } from './entities/user.entity'
import { Client } from './entities/client.entity'
import { Supplier } from './entities/supplier.entity'
import { Category } from './entities/category.entity'
import { Product } from './entities/product.entity'
import { Ingredient } from './entities/ingredient.entity'
import { Recipe } from './entities/recipe.entity'
import { RecipeItem } from './entities/recipe-item.entity'
import { Purchase } from './entities/purchase.entity'
import { PurchaseItem } from './entities/purchase-item.entity'
import { StockMovement } from './entities/stock-movement.entity'
import { ProductionOrder } from './entities/production-order.entity'
import { ProductionOrderItem } from './entities/production-order-item.entity'
import { EmailLog } from './entities/email-log.entity'
import { AuditLog } from './entities/audit-log.entity'

export default defineConfig({
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  user: process.env.DATABASE_USER ?? 'superpao',
  password: process.env.DATABASE_PASSWORD ?? 'superpao',
  dbName: process.env.DATABASE_NAME ?? 'superpao',
  entities: [
    User,
    Client,
    Supplier,
    Category,
    Product,
    Ingredient,
    Recipe,
    RecipeItem,
    Purchase,
    PurchaseItem,
    StockMovement,
    ProductionOrder,
    ProductionOrderItem,
    EmailLog,
    AuditLog,
  ],
  extensions: [Migrator, SeedManager],
  migrations: {
    path: './src/migrations',
    pathTs: './src/migrations',
    glob: '!(*.d).{js,ts}',
  },
  seeder: {
    path: './src/seeders',
    pathTs: './src/seeders',
    defaultSeeder: 'DatabaseSeeder',
  },
  debug: process.env.NODE_ENV === 'development',
})
