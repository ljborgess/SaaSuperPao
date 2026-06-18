import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import {
  Product,
  Ingredient,
  Purchase,
  ProductionOrder,
  Client,
  Supplier,
  User,
  StockMovement,
} from '@superpao/database'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Product,
      Ingredient,
      Purchase,
      ProductionOrder,
      Client,
      Supplier,
      User,
      StockMovement,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
