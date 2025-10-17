import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import getUuid from '../shared/utils/getUuid'
import {
  DecodeOptions,
  GetPayloadOptions,
  GetSignOptionsOptions,
  IsRevokedOptions,
  RevokeOptions,
  RotateOptions,
  SignJwtOptions,
  SignOptions,
} from './jwts.types'
import { Credentials, EncodedJwt, JwtPayload } from '../shared/types'
import { SignedJwtsService } from '../signed-jwts/signed-jwts.service'
import { RevokedJwtsService } from 'src/revoked-jwts/revoked-jwts.service'

@Injectable()
export class JwtsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly signedJwtsService: SignedJwtsService,
    private readonly revokedJwtsService: RevokedJwtsService,
  ) {}

  async sign(sub: SignOptions): Promise<Credentials> {
    const access_token = await this.signJwt({ sub, type: 'access' })
    const refresh_token = await this.signJwt({ sub, type: 'refresh' })

    return { access_token, refresh_token }
  }

  revoke(jwt: RevokeOptions) {
    const { jti, exp } = this.decode(jwt)

    return this.revokedJwtsService.add({ jti, exp })
  }

  isRevoked(jti: IsRevokedOptions) {
    return this.revokedJwtsService.has(jti)
  }

  async rotate(jwts: RotateOptions) {
    await Promise.all([jwts.map(async (jwt) => await this.revoke(jwt))])

    const [, refresh_token] = jwts
    const { sub } = this.decode(refresh_token)

    return this.sign(sub)
  }

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

  private async signJwt({ sub, type }: SignJwtOptions) {
    const payload = this.getPayload(sub)
    const options = this.getSignOptions(type)

    const jwt = this.jwtService.sign(payload, options) as EncodedJwt

    await this.signedJwtsService.add(jwt)

    return jwt
  }

  private decode(jwt: DecodeOptions) {
    return this.jwtService.decode<JwtPayload>(jwt)
  }
}
