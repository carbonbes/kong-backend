import { Inject, Injectable } from '@nestjs/common'
import { JwtPayload } from './jwts.interface'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import getUuid from '../shared/utils/getUuid'
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'

@Injectable()
export class JwtsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private getSecret(configKey: string) {
    return this.configService.get<string>(configKey)
  }

  private getExpiresIn(configKey: string) {
    return Number(this.configService.get(configKey))
  }

  private signAccessJwt(sub: number) {
    const jti = getUuid()
    const payload = { jti, sub }

    const secret = this.getSecret('JWT_SIGN_OPTIONS_ACCESS_TOKEN_SECRET_KEY')
    const expiresIn = this.getExpiresIn(
      'JWT_SIGN_OPTIONS_ACCESS_TOKEN_EXPIRES_IN',
    )

    return this.jwtService.sign(payload, { secret, expiresIn })
  }

  private signRefreshJwt(sub: number) {
    const jti = getUuid()
    const payload = { jti, sub }

    const secret = this.getSecret('JWT_SIGN_OPTIONS_REFRESH_TOKEN_SECRET_KEY')
    const expiresIn = this.getExpiresIn(
      'JWT_SIGN_OPTIONS_REFRESH_TOKEN_EXPIRES_IN',
    )

    return this.jwtService.sign(payload, { secret, expiresIn })
  }

  async sign(sub: number) {
    const access_token = this.signAccessJwt(sub)
    const refresh_token = this.signRefreshJwt(sub)

    return { access_token, refresh_token }
  }
}
