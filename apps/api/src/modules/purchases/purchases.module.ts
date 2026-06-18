import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Purchase, PurchaseItem, Ingredient, Supplier, StockMovement, User } from '@superpao/database'
import { PurchasesController } from './purchases.controller'
import { PurchasesService } from './purchases.service'

@Module({
  imports: [MikroOrmModule.forFeature([Purchase, PurchaseItem, Ingredient, Supplier, StockMovement, User])],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule {}
