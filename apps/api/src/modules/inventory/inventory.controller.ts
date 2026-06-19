import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { UserRole, User } from '@superpao/database'
import { InventoryService } from './inventory.service'
import type { CreateIngredientDto, UpdateIngredientDto, CreateStockMovementDto, PaginationQuery } from '@superpao/shared-types'

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get('ingredients')
  findAllIngredients(@Query() q: PaginationQuery) {
    return this.service.findAllIngredients(q)
  }

  @Get('ingredients/:id')
  findOneIngredient(@Param('id') id: string) {
    return this.service.findOneIngredient(id)
  }

  @Post('ingredients')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  createIngredient(@Body() dto: CreateIngredientDto) {
    return this.service.createIngredient(dto)
  }

  @Patch('ingredients/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  updateIngredient(@Param('id') id: string, @Body() dto: UpdateIngredientDto) {
    return this.service.updateIngredient(id, dto)
  }

  @Delete('ingredients/:id')
  @Roles(UserRole.ADMIN)
  removeIngredient(@Param('id') id: string) {
    return this.service.removeIngredient(id)
  }

  @Get('movements')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  findAllMovements(@Query() q: PaginationQuery) {
    return this.service.findAllMovements(q)
  }

  @Post('movements')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  createMovement(@Body() dto: CreateStockMovementDto, @CurrentUser() user: User) {
    return this.service.createMovement(dto, user.id)
  }
}
