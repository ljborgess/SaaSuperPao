import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Recipe, RecipeItem, Product, Ingredient } from '@superpao/database'
import { RecipesService } from './recipes.service'
import { RecipesController } from './recipes.controller'

@Module({
  imports: [MikroOrmModule.forFeature([Recipe, RecipeItem, Product, Ingredient])],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}
