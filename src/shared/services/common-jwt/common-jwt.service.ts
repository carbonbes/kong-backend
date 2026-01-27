import { SignOptions } from './types'
import { EncodedJwt, JwtPayload } from '@/shared/types'
import { JwtService } from '@nestjs/jwt'
import { UuidService } from '@/shared/uuid/uuid.service'

export abstract class CommonJwtService {
  protected constructor(
    private readonly jwtService: JwtService,
    private readonly uuidService: UuidService,
  ) {}

  sign({ sub }: SignOptions) {
    const jti = this.uuidService.generate()
    const payload: Pick<JwtPayload, 'jti' | 'sub'> = { jti, sub }

    return this.jwtService.sign(payload) as EncodedJwt
  }
}
