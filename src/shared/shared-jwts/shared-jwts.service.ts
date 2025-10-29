import { GetPayloadOptions, SignOptions, Type } from './types'
import { EncodedJwt } from '@/shared/types/jwt.type'
import getUuid from '@/shared/utils/getUuid'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

export abstract class SharedJwtsService {
  protected constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly type: Type,
  ) {}

  sign({ sub }: SignOptions) {
    const payload = this.getPayload({ sub })
    const options = this.getOptions()

    return this.jwtService.sign({ payload, options }) as EncodedJwt
  }

  private getPayload({ sub }: GetPayloadOptions) {
    const jti = getUuid()

    return { jti, sub }
  }

  private getOptions() {
    const key = this.type.toUpperCase()

    const expiresIn = Number(
      this.configService.get(`JWT_SIGN_OPTIONS_${key}_TOKEN_EXPIRES_IN`),
    )

    return { expiresIn }
  }
}
