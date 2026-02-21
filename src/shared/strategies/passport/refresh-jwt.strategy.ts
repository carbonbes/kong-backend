import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtPayload } from '@/shared/types'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { RevokedJwtsService } from '@/revoked-jwts/revoked-jwts.service'

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt-strategy',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly revokedJwtsService: RevokedJwtsService,
  ) {
    const jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
    const secretOrKey = configService.get('jwt.refreshJwtSecret')!

    super({ jwtFromRequest, ignoreExpiration: false, secretOrKey })
  }

  async validate({ jti }: JwtPayload) {
    const isRevoked = await this.revokedJwtsService.has({ jti })

    if (isRevoked) {
      throw new UnauthorizedException()
    }

    return true
  }
}
