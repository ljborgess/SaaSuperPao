import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { StockMovement, Ingredient, Product, User } from '@superpao/database'
import { InventoryController } from './inventory.controller'
import { InventoryService } from './inventory.service'

@Module({
  imports: [MikroOrmModule.forFeature([StockMovement, Ingredient, Product, User])],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
