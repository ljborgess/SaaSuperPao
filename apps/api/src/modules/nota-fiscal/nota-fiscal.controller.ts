import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { UserRole, User } from '@superpao/database'
import { NotaFiscalService } from './nota-fiscal.service'
import type { EmitirNotaFiscalDto, CancelarNotaFiscalDto, PaginationQuery } from '@superpao/shared-types'

@ApiTags('Nota Fiscal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nota-fiscal')
export class NotaFiscalController {
  constructor(private readonly service: NotaFiscalService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAll(@Query() q: PaginationQuery) {
    return this.service.findAll(q)
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Emitir NFS-e via GerandoNotaFacil' })
  emitir(@Body() dto: EmitirNotaFiscalDto, @CurrentUser() user: User) {
    return this.service.emitir(dto, user.id)
  }

  @Post(':id/cancelar')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar NFS-e emitida' })
  cancelar(@Param('id') id: string, @Body() dto: CancelarNotaFiscalDto) {
    return this.service.cancelar(id, dto)
  }
}
