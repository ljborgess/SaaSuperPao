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
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getStats() { return this.service.getStats() }

  @Get('top-products')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getTopProducts() { return this.service.getTopProducts() }

  @Get('low-stock')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getLowStock() { return this.service.getLowStock() }

  @Get('activity')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getActivity() { return this.service.getActivity() }

  @Get('notifications')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR)
  getNotifications() { return this.service.getNotifications() }

  @Get('trends')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getTrends() { return this.service.getTrends() }
}
