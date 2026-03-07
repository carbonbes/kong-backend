import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { JWT_CREATED } from '@/shared/auth-jwt/consts'
import { SignedJwtsService } from '@/signed-jwts/signed-jwts.service'
import { JwtCreatedEvent } from '@/shared/auth-jwt/events'

@Injectable()
export class JwtCreatedListener {
  constructor(private readonly signedJwtsService: SignedJwtsService) {}

  @OnEvent(JWT_CREATED)
  async handleJwtCreated({ jti, sub, exp }: JwtCreatedEvent) {
    await this.signedJwtsService.add({ jti, sub, exp })
  }
}
