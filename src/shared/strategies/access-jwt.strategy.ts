import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtPayload } from '@/shared/types/jwt.type'
import { User } from '@/users/types'
import { UsersService } from '@/users/users.service'
import { JwtsService } from '@/jwts/jwts.service'
import { JwtSignOptionsConfig } from '@/config/types'

declare module 'express-serve-static-core' {
  interface Request {
    user: User
  }
}

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(
  Strategy,
  'access-jwt-strategy',
) {
  constructor(
    private readonly configService: ConfigService<JwtSignOptionsConfig, true>,
    private readonly usersService: UsersService,
    private readonly jwtsService: JwtsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('accessJwtSecret'),
    })
  }

  async validate({ jti, sub }: JwtPayload) {
    const isRevoked = await this.jwtsService.isRevoked({ jti })

    if (isRevoked) {
      throw new UnauthorizedException()
    }

    return this.usersService.findOne({ where: { id: sub } })
  }
}
