import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/core'
import { User, UserStatus } from '@superpao/database'
import type { JwtPayload } from '@superpao/shared-types'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectRepository(User) private readonly userRepo: EntityRepository<User>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: (() => {
        const secret = process.env.JWT_SECRET
        if (!secret) throw new Error('JWT_SECRET environment variable is required')
        return secret
      })(),
    })
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userRepo.findOne({ id: payload.sub, status: UserStatus.ACTIVE })
    if (!user) throw new UnauthorizedException()
    return user
  }
}
