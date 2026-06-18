import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from '@superpao/database'
import { CategoriesService } from './categories.service'
import type { CreateCategoryDto, UpdateCategoryDto, PaginationQuery } from '@superpao/shared-types'

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

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
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto)
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
