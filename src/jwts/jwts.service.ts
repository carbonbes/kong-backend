import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import getUuid from '../shared/utils/getUuid'
import {
  DecodeOptions,
  EncodedJwt,
  GetPayloadOptions,
  GetSignOptionsOptions,
  IsRevokedOptions,
  JwtPayload,
  RevokeOptions,
  RotateOptions,
  SignJwtOptions,
  SignOptions,
} from './jwts.types'
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'

@Injectable()
export class JwtsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private getPayload(sub: GetPayloadOptions) {
    const jti = getUuid()

    return { jti, sub }
  }

  private getSignOptions(type: GetSignOptionsOptions) {
    const key = type.toUpperCase()

    const secret = this.configService.get<string>(
      `JWT_SIGN_OPTIONS_${key}_TOKEN_SECRET_KEY`,
    )

    const expiresIn = Number(
      this.configService.get(`JWT_SIGN_OPTIONS_${key}_TOKEN_EXPIRES_IN`),
    )

    return { secret, expiresIn }
  }

  private signJwt({ sub, type }: SignJwtOptions) {
    const payload = this.getPayload(sub)
    const options = this.getSignOptions(type)

    return this.jwtService.sign(payload, options) as EncodedJwt
  }

  sign(sub: SignOptions) {
    const access_token = this.signJwt({ sub, type: 'access' })
    const refresh_token = this.signJwt({ sub, type: 'refresh' })

    return { access_token, refresh_token }
  }

  private decode(jwt: DecodeOptions) {
    return this.jwtService.decode<JwtPayload>(jwt)
  }

  async revoke(jwt: RevokeOptions) {
    const { jti, exp } = this.decode(jwt)

    const ttl = (exp - Math.round(Date.now() / 1000)) * 1000

    await this.cacheManager.set(jti, ' ', ttl)

    return true
  }

  async isRevoked(jti: IsRevokedOptions) {
    return !!(await this.cacheManager.get<string>(jti))
  }

  async rotate(credentials: RotateOptions) {
    await Promise.all([credentials.map(async (jwt) => await this.revoke(jwt))])

    const [, refresh_token] = credentials
    const { sub } = this.decode(refresh_token)

    return this.sign(sub)
  }
}
