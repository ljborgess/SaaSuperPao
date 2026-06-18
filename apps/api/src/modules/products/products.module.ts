import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Product, Category } from '@superpao/database'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'

@Module({
  imports: [MikroOrmModule.forFeature([Product, Category])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
