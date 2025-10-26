import { Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtPayload } from '../types/jwt.type'
import { User } from '@/users/types'
import { UsersService } from '@/users/users.service'
import { JwtsService } from '@/jwts/jwts.service'
import { Request } from 'express'
import { ACCESS_TOKEN_NAME } from '../consts'

declare module 'express-serve-static-core' {
  interface Request {
    user: User
  }
}

const jwtCookieExtractor = (req: Request) => {
  return req.cookies[ACCESS_TOKEN_NAME]
}

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(
  Strategy,
  'access-jwt',
) {
  constructor(
    readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtsService: JwtsService,
  ) {
    super({
      jwtFromRequest: jwtCookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get(
        'JWT_SIGN_OPTIONS_ACCESS_TOKEN_SECRET_KEY',
      ),
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
