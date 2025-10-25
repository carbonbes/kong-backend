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
  SignReturn,
} from './jwts.types'
import { EncodedJwt, JwtPayload } from '@/shared/types/jwt.type'
import { SignedJwtsService } from '@/signed-jwts/signed-jwts.service'
import { RevokedJwtsSchema } from '@/revoked-jwts/revoked-jwts.schema'

@Injectable()
export class JwtsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly signedJwtsService: SignedJwtsService,
    private readonly revokedJwtsService: RevokedJwtsSchema,
  ) {}

  async sign(sub: SignOptions): SignReturn {
    const access_token = await this.signJwt({ sub, type: 'access' })
    const refresh_token = await this.signJwt({ sub, type: 'refresh' })

    return { access_token, refresh_token }
  }

  revoke(jwt: RevokeOptions) {
    const { jti, exp } = this.decode(jwt)

    this.revokedJwtsService.add({ jti, exp })
  }

  isRevoked(jti: IsRevokedOptions) {
    return this.revokedJwtsService.has(jti)
  }

  rotate(credentials: RotateOptions) {
    Object.values(credentials).forEach((credential) => {
      if (!credential) return

      this.revoke(credential)
    })

    const { refresh_token } = credentials
    const { sub } = this.decode(refresh_token)

    return this.sign(sub)
  }

  decode(jwt: DecodeOptions) {
    return this.jwtService.decode<JwtPayload>(jwt)
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
    const { jti, exp } = this.decode(jwt)

    await this.signedJwtsService.add({ jti, sub, exp })

    return jwt
  }
}
