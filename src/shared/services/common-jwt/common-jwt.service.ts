import { SignOptions } from './types'
import { EncodedJwt, JwtPayload } from '@/shared/types'
import getUuid from '@/shared/utils/getUuid'
import { JwtService } from '@nestjs/jwt'

export abstract class CommonJwtService {
  protected constructor(private readonly jwtService: JwtService) {}

  sign({ sub }: SignOptions) {
    const payload: Pick<JwtPayload, 'jti' | 'sub'> = { jti: getUuid(), sub }

    return this.jwtService.sign(payload) as EncodedJwt
  }
}
