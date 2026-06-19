import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { UserRole, User } from '@superpao/database'
import { ProductionService } from './production.service'
import type { CreateProductionOrderDto, UpdateConsumptionDto, UpdateProductionOrderDto, PaginationQuery } from '@superpao/shared-types'

@ApiTags('Production')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('production')
export class ProductionController {
  constructor(private readonly service: ProductionService) {}

  @Get()
  findAll(@Query() q: PaginationQuery) {
    return this.service.findAll(q)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Get(':id/variance')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get variance between planned and actual ingredient consumption' })
  getVariance(@Param('id') id: string) {
    return this.service.getVariance(id)
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a production order from a recipe' })
  create(@Body() dto: CreateProductionOrderDto) {
    return this.service.create(dto)
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update pending/in-progress production order' })
  update(@Param('id') id: string, @Body() dto: UpdateProductionOrderDto) {
    return this.service.update(id, dto)
  }

  @Patch(':id/consumption')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Register actual ingredient consumption (MANUAL mode only)' })
  updateConsumption(@Param('id') id: string, @Body() dto: UpdateConsumptionDto) {
    return this.service.updateConsumption(id, dto)
  }

  @Patch(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Complete production order and update stock' })
  complete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.complete(id, user.id)
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Cancel production order' })
  cancel(@Param('id') id: string) {
    return this.service.cancel(id)
  }
}
