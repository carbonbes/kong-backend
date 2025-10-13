import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtPayload } from '../jwts/jwts.interface'
import { JwtsService } from '../jwts/jwts.service'

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt-strategy',
) {
  constructor(
    configService: ConfigService,
    private readonly jwtsService: JwtsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(
        'JWT_SIGN_OPTIONS_REFRESH_TOKEN_SECRET_KEY',
      ),
    })
  }

  async validate({ jti }: JwtPayload) {
    const jwtIsRevoked = await this.jwtsService.isRevoked(jti)

    if (jwtIsRevoked) {
      throw new UnauthorizedException()
    }

    return true
  }
}
