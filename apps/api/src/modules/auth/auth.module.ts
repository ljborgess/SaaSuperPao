import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { User } from '@superpao/database'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'
import { EmailModule } from '../email/email.module'
import { AuditModule } from '../audit/audit.module'

@Module({
  imports: [
    MikroOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET')
        if (!secret) throw new Error('JWT_SECRET environment variable is required')
        return {
          secret,
          signOptions: { expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '15m') as any },
        }
      },
      inject: [ConfigService],
    }),
    EmailModule,
    AuditModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
