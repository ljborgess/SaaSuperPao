import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/core'
import { User, UserStatus } from '@superpao/database'
import { EmailService } from '../email/email.service'
import { AuditService } from '../audit/audit.service'
import { AuditAction } from '@superpao/database'
import { randomBytes, createHash } from 'crypto'

const MAX_LOGIN_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000 // 15 minutes

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly auditService: AuditService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepo.findOne({ email, status: UserStatus.ACTIVE })

    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Conta temporariamente bloqueada. Tente novamente em 15 minutos.')
    }

    const isValid = user ? await user.comparePassword(password) : false

    if (!user || !isValid) {
      if (user) {
        user.loginAttempts = (user.loginAttempts ?? 0) + 1
        const justLocked = user.loginAttempts >= MAX_LOGIN_ATTEMPTS
        if (justLocked) {
          user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS)
        }
        await this.userRepo.getEntityManager().flush()
        await this.auditService.log({
          userId: user.id,
          action: AuditAction.LOGIN_FAILED,
          entity: 'auth',
          payload: { email, attempts: user.loginAttempts, locked: justLocked },
        })
        if (justLocked) {
          this.emailService
            .sendAccountLocked(user.email, user.name, user.loginAttempts)
            .catch((err: Error) => this.logger.error(`Account locked email failed: ${err.message}`))
        }
      }
      throw new UnauthorizedException('Credenciais inválidas.')
    }

    if (user.loginAttempts > 0 || user.lockedUntil) {
      user.loginAttempts = 0
      user.lockedUntil = undefined
      await this.userRepo.getEntityManager().flush()
    }

    return user
  }

  async login(user: User, ip?: string) {
    const payload = { sub: user.id, role: user.role }
    const accessToken = this.jwtService.sign(payload)

    const refreshSecret = process.env.JWT_REFRESH_SECRET
    if (!refreshSecret) throw new Error('JWT_REFRESH_SECRET environment variable is required')

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as any,
    })
    user.refreshToken = refreshToken
    await this.userRepo.getEntityManager().flush()
    await this.auditService.log({ userId: user.id, action: AuditAction.LOGIN, entity: 'auth', ip })
    return { accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } }
  }

  async logout(userId: string) {
    const user = await this.userRepo.findOneOrFail(userId)
    user.refreshToken = undefined
    await this.userRepo.getEntityManager().flush()
    await this.auditService.log({ userId, action: AuditAction.LOGOUT, entity: 'auth' })
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ email })
    if (!user) return
    const plainToken = randomBytes(32).toString('hex')
    const hashedToken = createHash('sha256').update(plainToken).digest('hex')
    user.passwordResetToken = hashedToken
    user.passwordResetExpires = new Date(Date.now() + 3600_000)
    await this.userRepo.getEntityManager().flush()
    this.emailService
      .sendPasswordReset(email, plainToken, user.name)
      .catch((err: Error) => this.logger.error(`Email dispatch failed: ${err.message}`))
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = createHash('sha256').update(token).digest('hex')
    const user = await this.userRepo.findOne({ passwordResetToken: hashedToken })
    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Token inválido ou expirado.')
    }
    user.password = newPassword
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    user.loginAttempts = 0
    user.lockedUntil = undefined
    await this.userRepo.getEntityManager().flush()
    await this.auditService.log({ userId: user.id, action: AuditAction.PASSWORD_RESET, entity: 'auth' })
  }

  async updateProfile(userId: string, name: string, avatarUrl?: string) {
    const user = await this.userRepo.findOneOrFail(userId)
    user.name = name
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl
    await this.userRepo.getEntityManager().flush()
    return { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl }
  }

  async refreshTokens(refreshToken: string) {
    const refreshSecret = process.env.JWT_REFRESH_SECRET
    if (!refreshSecret) throw new Error('JWT_REFRESH_SECRET environment variable is required')
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: refreshSecret })
      const user = await this.userRepo.findOne({ id: payload.sub, refreshToken })
      if (!user) throw new UnauthorizedException()
      return this.login(user)
    } catch {
      throw new UnauthorizedException('Refresh token inválido.')
    }
  }
}
