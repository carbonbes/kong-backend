import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AccessJwtPayload, JwtPayload } from './interface'

declare module 'express-serve-static-core' {
  interface Request {
    user: JwtPayload['user']
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_STRATEGY_SECRET_KEY'),
    })
  }

  async validate({ type, user }: AccessJwtPayload) {
    if (type !== 'access_token') {
      throw new UnauthorizedException()
    }

    return user
  }
}
