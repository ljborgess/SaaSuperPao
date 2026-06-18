import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { Throttle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { User } from '@superpao/database'
import { LoginDto, ForgotPasswordDto, ResetPasswordDto } from '@superpao/shared-types'
import type { Request } from 'express'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  login(@CurrentUser() user: User, @Req() req: Request) {
    return this.authService.login(user, req.ip)
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  logout(@CurrentUser() user: User) {
    return this.authService.logout(user.id)
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken)
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 300000 } })
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email)
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password)
  }
}
