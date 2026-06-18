import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { UserRole, User } from '@superpao/database'
import { PurchasesService } from './purchases.service'
import type { CreatePurchaseDto, PaginationQuery } from '@superpao/shared-types'

@ApiTags('Purchases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly service: PurchasesService) {}

  @Get()
  findAll(@Query() q: PaginationQuery) {
    return this.service.findAll(q)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() dto: CreatePurchaseDto, @CurrentUser() user: User) {
    return this.service.create(dto, user.id)
  }

  @Patch(':id/receive')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Mark purchase as received and update stock' })
  receive(@Param('id') id: string) {
    return this.service.receive(id)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
