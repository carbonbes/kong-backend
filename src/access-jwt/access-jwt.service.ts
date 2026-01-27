import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { CommonJwtService } from '@/shared/services/common-jwt/common-jwt.service'
import { UuidService } from '@/shared/uuid/uuid.service'

@Injectable()
export class AccessJwtService extends CommonJwtService {
  constructor(jwtService: JwtService, uuidService: UuidService) {
    super(jwtService, uuidService)
  }
}
