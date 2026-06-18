import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import {
  Product,
  Ingredient,
  Purchase,
  ProductionOrder,
  Supplier,
  Client,
} from '@superpao/database'
import { AiController } from './ai.controller'
import { AiService } from './ai.service'

@Module({
  imports: [MikroOrmModule.forFeature([Product, Ingredient, Purchase, ProductionOrder, Supplier, Client])],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
