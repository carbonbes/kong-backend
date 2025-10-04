import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtPayload } from '../jwts/jwts.interface'
import { User } from '../users/user.entity'
import { UsersService } from '../users/users.service'

declare module 'express-serve-static-core' {
  interface Request {
    user: User
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(
        'JWT_SIGN_OPTIONS_ACCESS_TOKEN_SECRET_KEY',
      ),
    })
  }

  async validate({ sub }: JwtPayload) {
    return await this.usersService.findOneBy({ id: sub })
  }
}
