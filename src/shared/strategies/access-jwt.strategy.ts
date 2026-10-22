import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtPayload } from '@/shared/types'
import { UsersService } from '@/users/users.service'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { RevokedJwtsService } from '@/revoked-jwts/revoked-jwts.service'
import { Request } from 'express'
import { ACCESS_TOKEN_COOKIE_NAME } from '@/shared/consts'

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(
  Strategy,
  'access-jwt-strategy',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly revokedJwtsService: RevokedJwtsService,
  ) {
    const jwtFromRequest = ExtractJwt.fromExtractors([
      (req: Request) => req.cookies[ACCESS_TOKEN_COOKIE_NAME],
    ])
    const secretOrKey = configService.get('jwt.accessJwtSecret')!

    super({ jwtFromRequest, ignoreExpiration: false, secretOrKey })
  }

  async validate({ jti, sub }: JwtPayload) {
    const isRevoked = await this.revokedJwtsService.has({ jti })

    if (isRevoked) {
      throw new UnauthorizedException()
    }

    return this.usersService.findUnique({ where: { email: sub } })
  }
}
