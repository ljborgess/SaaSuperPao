import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from '@superpao/database'
import { ProductionService } from './production.service'
import type { CreateProductionOrderDto, PaginationQuery } from '@superpao/shared-types'

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

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a production order from a recipe' })
  create(@Body() dto: CreateProductionOrderDto) {
    return this.service.create(dto)
  }

  @Patch(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Complete production order and update stock' })
  complete(@Param('id') id: string) {
    return this.service.complete(id)
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Cancel production order' })
  cancel(@Param('id') id: string) {
    return this.service.cancel(id)
  }
}
