import { JwtService } from '@nestjs/jwt'
import { UuidService } from '@/shared/uuid/uuid.service'
import { Injectable } from '@nestjs/common'
import { CredentialJwtService } from '@/shared/credential-jwt/credential-jwt.service'

@Injectable()
export class RefreshJwtService extends CredentialJwtService {
  constructor(jwtService: JwtService, uuidService: UuidService) {
    super(jwtService, uuidService)
  }
}
