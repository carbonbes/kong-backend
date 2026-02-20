import { Injectable } from '@nestjs/common'
import {
  AuthJwts,
  DecodeOptions,
  IsRevokedOptions,
  RevokeOptions,
  RotateOptions,
  SignOptions,
} from './auth-jwts.types'
import { AccessJwtService } from '@/access-jwt/access-jwt.service'
import { RefreshJwtService } from '@/refresh-jwt/refresh-jwt.service'
import { SignedJwtsService } from '@/signed-jwts/signed-jwts.service'
import { RevokedJwtsService } from '@/revoked-jwts/revoked-jwts.service'
import { getDecodedJwt } from '@/shared/utils'

@Injectable()
export class AuthJwtsService {
  constructor(
    private readonly accessJwtService: AccessJwtService,
    private readonly refreshJwtService: RefreshJwtService,
    private readonly signedJwtsService: SignedJwtsService,
    private readonly revokedJwtsService: RevokedJwtsService,
  ) {}

  async sign({ sub }: SignOptions) {
    const authJwts: AuthJwts = {
      accessToken: this.accessJwtService.sign({ sub }),
      refreshToken: this.refreshJwtService.sign({ sub }),
    }

    await Promise.all([
      Object.values(authJwts).map(async (jwt) => {
        const { jti, sub, exp } = this.decode(jwt)

        await this.signedJwtsService.add({ jti, sub, exp })
      }),
    ])

    return authJwts
  }

  revoke(jwt: RevokeOptions) {
    const { jti, sub, exp } = this.decode(jwt)

    return this.revokedJwtsService.add({ jti, sub, exp })
  }

  isRevoked({ jti }: IsRevokedOptions) {
    return this.revokedJwtsService.has({ jti })
  }

  async rotate(jwt: RotateOptions) {
    await this.revoke(jwt)

    const { sub } = this.decode(jwt)

    return this.sign({ sub })
  }

  decode(jwt: DecodeOptions) {
    return getDecodedJwt(jwt)
  }
}
