import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from '@superpao/database'
import { DashboardService } from './dashboard.service'

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('stats')
  getStats() { return this.service.getStats() }

  @Get('top-products')
  getTopProducts() { return this.service.getTopProducts() }

  @Get('low-stock')
  getLowStock() { return this.service.getLowStock() }

  @Get('activity')
  getActivity() { return this.service.getActivity() }
}
