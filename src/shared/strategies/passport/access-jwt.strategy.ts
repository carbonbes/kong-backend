import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtPayload } from '@/shared/types'
import { UsersService } from '@/users/users.service'
import { AuthJwtsService } from '@/auth-jwts/auth-jwts.service'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(
  Strategy,
  'access-jwt-strategy',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly authJwtsService: AuthJwtsService,
  ) {
    const secretOrKey = configService.get('jwt-sign-options.accessJwtSecret')!

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
    })
  }

  async validate({ jti, sub }: JwtPayload) {
    const isRevoked = await this.authJwtsService.isRevoked({ jti })

    if (isRevoked) {
      throw new UnauthorizedException()
    }

    return this.usersService.findOne({ where: { id: sub } })
  }
}
