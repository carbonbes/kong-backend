import { SignOptions } from './auth-jwt.types'
import { EncodedJwt, JwtPayload } from '@/shared/types'
import { JwtService } from '@nestjs/jwt'
import { UuidService } from '@/shared/uuid/uuid.service'

export abstract class AuthJwtService {
  protected constructor(
    private readonly jwtService: JwtService,
    private readonly uuidService: UuidService,
  ) {}

  sign({ sub }: SignOptions): EncodedJwt {
    const jti = this.uuidService.generate()
    const payload: Pick<JwtPayload, 'jti' | 'sub'> = { jti, sub }

    return this.jwtService.sign(payload) as EncodedJwt
  }

  verify(jwt: EncodedJwt): JwtPayload {
    return this.jwtService.verify(jwt)
  }

  decode(jwt: EncodedJwt): JwtPayload {
    return this.jwtService.decode(jwt)
  }
}
