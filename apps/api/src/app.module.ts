import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { mikroOrmConfig } from '@superpao/database'
import { AiModule } from './modules/ai/ai.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { ClientsModule } from './modules/clients/clients.module'
import { SuppliersModule } from './modules/suppliers/suppliers.module'
import { CategoriesModule } from './modules/categories/categories.module'
import { ProductsModule } from './modules/products/products.module'
import { InventoryModule } from './modules/inventory/inventory.module'
import { PurchasesModule } from './modules/purchases/purchases.module'
import { ProductionModule } from './modules/production/production.module'
import { DashboardModule } from './modules/dashboard/dashboard.module'
import { EmailModule } from './modules/email/email.module'
import { AuditModule } from './modules/audit/audit.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]),
    MikroOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        ...mikroOrmConfig,
        host: config.get('DATABASE_HOST') ?? 'localhost',
        port: Number(config.get('DATABASE_PORT') ?? 5432),
        user: config.get('DATABASE_USER') ?? 'superpao',
        password: config.get('DATABASE_PASSWORD') ?? 'superpao',
        dbName: config.get('DATABASE_NAME') ?? 'superpao',
      }),
      inject: [ConfigService],
    }),
    AiModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    SuppliersModule,
    CategoriesModule,
    ProductsModule,
    InventoryModule,
    PurchasesModule,
    ProductionModule,
    DashboardModule,
    EmailModule,
    AuditModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
