import { Injectable } from '@nestjs/common'
import {
  Jwts,
  DecodeOptions,
  IsRevokedOptions,
  RevokeOptions,
  RotateOptions,
  SignJwtOptions,
  SignOptions,
} from './jwts.types'
import { EncodedJwt, JwtPayload } from '@/shared/types'
import getDecodedJwt from '@/shared/utils/getDecodedJwt'
import { JwtStorageService } from '@/jwt-storage/jwt-storage.service'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UuidService } from '@/shared/uuid/uuid.service'

@Injectable()
export class JwtsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly jwtStorageService: JwtStorageService,
    private readonly uuidService: UuidService,
  ) {}

  async sign({ sub }: SignOptions): Promise<Jwts> {
    const jwts: Jwts = {
      access_token: this.signJwt({ sub, type: 'access_token' }),
      refresh_token: this.signJwt({ sub, type: 'refresh_token' }),
    }

    await Promise.all([
      Object.values(jwts).map(async (jwt) => {
        const { jti, sub, exp } = this.decode({ jwt })

        await this.jwtStorageService.add({ jti, sub, typ: 'signed', exp })
      }),
    ])

    return jwts
  }

  revoke({ jwt }: RevokeOptions) {
    const { jti, sub, exp } = this.decode({ jwt })

    return this.jwtStorageService.add({ jti, sub, typ: 'revoked', exp })
  }

  isRevoked({ jti }: IsRevokedOptions) {
    return this.jwtStorageService.has({ jti })
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
    return getDecodedJwt(jwt)
  }

  private signJwt({ sub, type }: SignJwtOptions): EncodedJwt {
    const secret =
      type === 'access_token'
        ? this.configService.get('jwt-sign-options.accessJwtSecret')!
        : this.configService.get('jwt-sign-options.refreshJwtSecret')!

    const expiresIn = Number(
      type === 'access_token'
        ? this.configService.get('jwt-sign-options.accessJwtExpiresIn')
        : this.configService.get('jwt-sign-options.refreshJwtExpiresIn'),
    )

    const jti = this.uuidService.generate()

    const payload: Pick<JwtPayload, 'jti' | 'sub'> = { jti, sub }
    const options: JwtSignOptions = { secret, expiresIn }

    return this.jwtService.sign(payload, options) as EncodedJwt
  }
}
