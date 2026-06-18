import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from '@superpao/database'
import { UsersService } from './users.service'
import type { CreateUserDto, UpdateUserDto, PaginationQuery } from '@superpao/shared-types'

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAll(@Query() query: PaginationQuery) {
    return this.service.findAll(query)
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto)
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
