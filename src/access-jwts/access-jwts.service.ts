import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { SharedJwtsService } from '@/shared/shared-jwts/shared-jwts.service'

@Injectable()
export class AccessJwtsService extends SharedJwtsService {
  constructor(configService: ConfigService, jwtService: JwtService) {
    super(configService, jwtService, 'access')
  }
}
