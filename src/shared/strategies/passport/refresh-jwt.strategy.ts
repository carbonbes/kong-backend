import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtPayload } from '@/shared/types/jwt.type'
import { JwtsService } from '@/jwts/jwts.service'
import { CreateJwtStrategy } from '@/shared/strategies/passport/utils/createJwtStrategy'
import { REFRESH_TOKEN_NAME } from '@/shared/consts'

@Injectable()
export class RefreshJwtStrategy extends CreateJwtStrategy({
  name: 'refresh-jwt-strategy',
  cookieName: REFRESH_TOKEN_NAME,
}) {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtsService: JwtsService,
  ) {
    const secret = configService.get('jwt-sign-options.refreshJwtSecret')

    super(secret)
  }

  async validate({ jti }: JwtPayload) {
    const isRevoked = await this.jwtsService.isRevoked({ jti })

    if (isRevoked) {
      throw new UnauthorizedException()
    }

    return true
  }
}
