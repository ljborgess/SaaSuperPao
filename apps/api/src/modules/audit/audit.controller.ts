import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from '@superpao/database'
import { AuditService } from './audit.service'
import type { PaginationQuery } from '@superpao/shared-types'

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('audit')
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get()
  findAll(@Query() q: PaginationQuery) {
    return this.service.findAll(q)
  }
}
