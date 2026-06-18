import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { ProductionOrder, ProductionOrderItem, Product, Recipe, RecipeItem, Ingredient, StockMovement, User } from '@superpao/database'
import { ProductionController } from './production.controller'
import { ProductionService } from './production.service'

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ProductionOrder,
      ProductionOrderItem,
      Product,
      Recipe,
      RecipeItem,
      Ingredient,
      StockMovement,
      User,
    ]),
  ],
  controllers: [ProductionController],
  providers: [ProductionService],
})
export class ProductionModule {}
