import { Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtPayload } from '../../jwts/jwts.types'
import { JwtsService } from '../../jwts/jwts.service'
import { Request } from 'express'

const jwtCookieExtractor = (req: Request) => {
  return req.cookies['refresh_token']
}

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    configService: ConfigService,
    private readonly jwtsService: JwtsService,
  ) {
    super({
      jwtFromRequest: jwtCookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get(
        'JWT_SIGN_OPTIONS_REFRESH_TOKEN_SECRET_KEY',
      ),
    })
  }

  async validate({ jti }: JwtPayload) {
    const isRevoked = await this.jwtsService.isRevoked(jti)

    if (isRevoked) {
      throw new UnauthorizedException()
    }

    return true
  }
}
