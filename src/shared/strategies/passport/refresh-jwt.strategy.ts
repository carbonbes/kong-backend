import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtPayload } from '@/shared/types'
import { AuthJwtsService } from '@/auth-jwts/auth-jwts.service'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt-strategy',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authJwtsService: AuthJwtsService,
  ) {
    const secretOrKey = configService.get('jwt-sign-options.refreshJwtSecret')!

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
    })
  }

  async validate({ jti }: JwtPayload) {
    const isRevoked = await this.authJwtsService.isRevoked({ jti })

    if (isRevoked) {
      throw new UnauthorizedException()
    }

    return true
  }
}
