import { EncodedJwt, JwtPayload } from '@/shared/types'
import { JwtService } from '@nestjs/jwt'
import { UuidService } from '@/shared/uuid/uuid.service'
import {
  DecodeOptions,
  DecodeReturn,
  SignOptions,
  SignReturn,
  VerifyOptions,
  VerifyReturn,
} from '@/shared/auth-jwt/types'

export abstract class AuthJwtService {
  protected constructor(
    private readonly jwtService: JwtService,
    private readonly uuidService: UuidService,
  ) {}

  sign({ sub }: SignOptions): SignReturn {
    const jti = this.uuidService.generate()
    const payload: Pick<JwtPayload, 'jti' | 'sub'> = { jti, sub }

    return this.jwtService.sign(payload) as EncodedJwt
  }

  verify(jwt: VerifyOptions): VerifyReturn {
    return this.jwtService.verify(jwt)
  }

  decode(jwt: DecodeOptions): DecodeReturn {
    return this.jwtService.decode(jwt)
  }
}
