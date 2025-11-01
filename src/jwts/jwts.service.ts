import { Injectable } from '@nestjs/common'
import {
  DecodeOptions,
  IsRevokedOptions,
  RevokeOptions,
  RotateOptions,
  SignOptions,
} from './types'
import { JwtPayload } from '@/shared/types/jwt.type'
import { RevokedJwtsService } from '@/revoked-jwts/revoked-jwts.service'
import { Jwts } from '@/shared/types/jwts'
import { AccessJwtService } from '@/access-jwt/access-jwt.service'
import { RefreshJwtService } from '@/refresh-jwt/refresh-jwt.service'
import { SignedJwtsService } from '@/signed-jwts/signed-jwts.service'

@Injectable()
export class JwtsService {
  constructor(
    private readonly accessJwtService: AccessJwtService,
    private readonly refreshJwtService: RefreshJwtService,
    private readonly signedJwtsService: SignedJwtsService,
    private readonly revokedJwtsService: RevokedJwtsService,
  ) {}

  async sign({ sub }: SignOptions): Promise<Jwts> {
    const jwts = {
      access_token: this.accessJwtService.sign({ sub }),
      refresh_token: this.refreshJwtService.sign({ sub }),
    }

    await Promise.all([
      Object.values(jwts).map(async (jwt) => {
        const { jti, sub, exp } = this.decode({ jwt })

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
      Object.values(jwts).map(async (jwt) => {
        if (!jwt) return

        await this.revoke({ jwt })
      }),
    ])

    const { refresh_token } = jwts
    const { sub } = this.decode({ jwt: refresh_token })

    return this.sign({ sub })
  }

  decode({ jwt }: DecodeOptions): JwtPayload {
    const base64Payload = jwt.split('.')[1]
    const payloadBuffer = Buffer.from(base64Payload, 'base64')

    return JSON.parse(payloadBuffer.toString())
  }
}
