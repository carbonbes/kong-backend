import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtPayload } from '@/shared/types/jwt.type'
import { UsersService } from '@/users/users.service'
import { JwtsService } from '@/jwts/jwts.service'
import { CreateJwtStrategy } from '@/shared/strategies/passport/utils/createJwtStrategy'
import { ACCESS_TOKEN_NAME } from '@/shared/consts'

@Injectable()
export class AccessJwtStrategy extends CreateJwtStrategy({
  name: 'access-jwt-strategy',
  cookieName: ACCESS_TOKEN_NAME,
}) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtsService: JwtsService,
  ) {
    const secret = configService.get('jwt-sign-options.accessJwtSecret')

    super(secret)
  }

  async validate({ jti, sub }: JwtPayload) {
    const isRevoked = await this.jwtsService.isRevoked({ jti })

    if (isRevoked) {
      throw new UnauthorizedException()
    }

    return this.usersService.findOne({ where: { id: sub } })
  }
}
