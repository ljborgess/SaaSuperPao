import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { RecipesService } from './recipes.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from '@superpao/database'
import type { CreateRecipeDto, UpdateRecipeDto, CreateRecipeItemDto, UpdateRecipeItemDto } from '@superpao/shared-types'

@Controller('recipes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get('by-product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.recipesService.findByProduct(productId)
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() dto: CreateRecipeDto) {
    return this.recipesService.create(dto)
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateRecipeDto) {
    return this.recipesService.update(id, dto)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.recipesService.remove(id)
  }

  @Post(':id/items')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  addItem(@Param('id') id: string, @Body() dto: CreateRecipeItemDto) {
    return this.recipesService.addItem(id, dto)
  }

  @Patch(':id/items/:itemId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  updateItem(@Param('id') id: string, @Param('itemId') itemId: string, @Body() dto: UpdateRecipeItemDto) {
    return this.recipesService.updateItem(id, itemId, dto)
  }

  @Delete(':id/items/:itemId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.recipesService.removeItem(id, itemId)
  }
}
