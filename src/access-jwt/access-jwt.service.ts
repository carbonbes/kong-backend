import { JwtService } from '@nestjs/jwt'
import { UuidService } from '@/shared/uuid/uuid.service'
import { Injectable } from '@nestjs/common'
import { AuthJwtService } from '@/shared/auth-jwt/auth-jwt.service'

@Injectable()
export class AccessJwtService extends AuthJwtService {
  constructor(jwtService: JwtService, uuidService: UuidService) {
    super(jwtService, uuidService)
  }
}
