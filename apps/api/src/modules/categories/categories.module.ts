import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Category } from '@superpao/database'
import { CategoriesController } from './categories.controller'
import { CategoriesService } from './categories.service'

@Module({
  imports: [MikroOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
