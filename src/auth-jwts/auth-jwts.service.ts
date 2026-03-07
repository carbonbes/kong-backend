import { Injectable } from '@nestjs/common'
import { AccessJwtService } from '@/access-jwt/access-jwt.service'
import { RefreshJwtService } from '@/refresh-jwt/refresh-jwt.service'
import { RevokedJwtsService } from '@/revoked-jwts/revoked-jwts.service'
import {
  RevokeJwtOptions,
  RevokeJwtReturn,
  RevokeOptions,
  RevokeReturn,
  RotateOptions,
  RotateReturn,
  SignOptions,
  SignReturn,
} from '@/auth-jwts/types'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/shared/consts'

@Injectable()
export class AuthJwtsService {
  constructor(
    private readonly accessJwtService: AccessJwtService,
    private readonly refreshJwtService: RefreshJwtService,
    private readonly revokedJwtsService: RevokedJwtsService,
  ) {}

  async sign(options: SignOptions): SignReturn {
    const { sub } = options

    return {
      [ACCESS_TOKEN_NAME]: this.accessJwtService.sign({ sub }),
      [REFRESH_TOKEN_NAME]: this.refreshJwtService.sign({ sub }),
    }
  }

  async revoke(options: RevokeOptions): RevokeReturn {
    this.revokeJwt(options)
  }

  async rotate(options: RotateOptions): RotateReturn {
    await this.revokeJwt(options)

    const { sub } = this.refreshJwtService.decode(options)

    return this.sign({ sub })
  }

  private async revokeJwt(options: RevokeJwtOptions): RevokeJwtReturn {
    try {
      const { jti, sub, exp } = this.refreshJwtService.verify(options)

      await this.revokedJwtsService.add({ jti, sub, exp })
    } catch {}
  }
}
