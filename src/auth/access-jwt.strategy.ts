import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtPayload } from '../jwts/jwts.interface'
import { User } from '../users/user.entity'
import { UsersService } from '../users/users.service'
import { JwtsService } from '../jwts/jwts.service'

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
    configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtsService: JwtsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(
        'JWT_SIGN_OPTIONS_ACCESS_TOKEN_SECRET_KEY',
      ),
    })
  }

  async validate({ jti, sub }: JwtPayload) {
    const jwtIsRevoked = await this.jwtsService.isRevoked(jti)

    if (jwtIsRevoked) {
      throw new UnauthorizedException()
    }

    return await this.usersService.findOneBy({ id: sub })
  }
}
