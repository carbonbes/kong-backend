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
import { EventEmitter2 } from '@nestjs/event-emitter'
import { JWT_CREATED } from '@/shared/auth-jwt/consts'
import { JwtCreatedEvent } from '@/shared/auth-jwt/events/jwt-created.event'

export abstract class AuthJwtService {
  protected constructor(
    private readonly jwtService: JwtService,
    private readonly uuidService: UuidService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  sign({ sub }: SignOptions): SignReturn {
    const jti = this.uuidService.generate()
    const payload: Pick<JwtPayload, 'jti' | 'sub'> = { jti, sub }

    const jwt = this.jwtService.sign(payload) as EncodedJwt
    this.eventEmitter.emit(JWT_CREATED, new JwtCreatedEvent(jwt))

    return jwt
  }

  verify(jwt: VerifyOptions): VerifyReturn {
    return this.jwtService.verify(jwt)
  }

  decode(jwt: DecodeOptions): DecodeReturn {
    return this.jwtService.decode(jwt)
  }
}
