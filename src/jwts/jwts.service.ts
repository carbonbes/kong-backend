import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import getUuid from '../shared/utils/getUuid'
import { JwtOptions, JwtPayload } from './jwts.interface'
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'

@Injectable()
export class JwtsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private getPayload(sub: number): Pick<JwtPayload, 'jti' | 'sub'> {
    const jti = getUuid()

    return { jti, sub }
  }

  private getOptions(
    type: 'access' | 'refresh',
  ): Pick<JwtOptions, 'secret' | 'expiresIn'> {
    const key = type.toUpperCase()

    const secret = this.configService.get<string>(
      `JWT_SIGN_OPTIONS_${key}_TOKEN_SECRET_KEY`,
    )

    const expiresIn = Number(
      this.configService.get(`JWT_SIGN_OPTIONS_${key}_TOKEN_EXPIRES_IN`),
    )

    return { secret, expiresIn }
  }

  private signJwt(sub: number, type: 'access' | 'refresh') {
    const payload = this.getPayload(sub)
    const options = this.getOptions(type)

    return this.jwtService.sign(payload, options)
  }

  async sign(sub: number) {
    const access_token = this.signJwt(sub, 'access')
    const refresh_token = this.signJwt(sub, 'refresh')

    return { access_token, refresh_token }
  }

  async revoke(jti: string, ttl: number) {
    return await this.cacheManager.set(jti, '', ttl)
  }

  async isRevoked(jti: string) {
    return !!(await this.cacheManager.get(jti))
  }

  async rotate(jti: string) {}
}
