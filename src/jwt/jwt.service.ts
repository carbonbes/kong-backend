import { Injectable } from '@nestjs/common'
import {
  Jwts,
  IsRevokedOptions,
  RevokeOptions,
  RotateOptions,
  SignOptions,
  VerifyOptions,
} from './jwt.types'
import { AccessJwtService } from '@/access-jwt/access-jwt.service'
import { RefreshJwtService } from '@/refresh-jwt/refresh-jwt.service'
import { SignedJwtsService } from '@/signed-jwts/signed-jwts.service'
import { RevokedJwtsService } from '@/revoked-jwts/revoked-jwts.service'

@Injectable()
export class JwtService {
  constructor(
    private readonly accessJwtService: AccessJwtService,
    private readonly refreshJwtService: RefreshJwtService,
    private readonly signedJwtsService: SignedJwtsService,
    private readonly revokedJwtsService: RevokedJwtsService,
  ) {}

  async sign({ sub }: SignOptions) {
    const jwts: Jwts = {
      access_token: this.accessJwtService.sign({ sub }),
      refresh_token: this.refreshJwtService.sign({ sub }),
    }

    await Promise.all([
      Object.entries(jwts).map(async ([type, jwt]) => {
        const { jti, sub, exp } = this.verify({ type, jwt })

        await this.signedJwtsService.add({ jti, sub, exp })
      }),
    ])

    return jwts
  }

  revoke({ jwt }: RevokeOptions) {
    const { jti, sub, exp } = this.decode({ jwt })

    return this.revokedJwtsService.add({ jti, sub, exp })
  }

  isRevoked({ jti }: IsRevokedOptions) {
    return this.revokedJwtsService.has({ jti })
  }

  async rotate(jwts: RotateOptions) {
    await Promise.all([
      Object.entries(jwts).map(async ([type, jwt]) => {
        if (!jwt) return

        await this.revoke({ jwt })
      }),
    ])

    const { refresh_token } = jwts
    const { sub } = this.verify({ type: 'refresh_token', jwt: refresh_token })

    return this.sign({ sub })
  }

  verify({ type, jwt }: VerifyOptions) {
    return type === 'access_token'
      ? this.accessJwtService.verify(jwt)
      : this.refreshJwtService.verify(jwt)
  }
}
