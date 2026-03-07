import { JwtService } from '@nestjs/jwt'
import { UuidService } from '@/shared/uuid/uuid.service'
import { Injectable } from '@nestjs/common'
import { AuthJwtService } from '@/shared/auth-jwt/auth-jwt.service'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class AccessJwtService extends AuthJwtService {
  constructor(
    jwtService: JwtService,
    uuidService: UuidService,
    eventEmitter: EventEmitter2,
  ) {
    super(jwtService, uuidService, eventEmitter)
  }
}
