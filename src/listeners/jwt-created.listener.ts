import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { JWT_CREATED } from '@/events/jwt-created/consts'
import { SignedJwtsService } from '@/signed-jwts/signed-jwts.service'
import { JwtCreatedEvent } from '@/events/jwt-created/jwt-created.event'

@Injectable()
export class JwtCreatedListener {
  constructor(private readonly signedJwtsService: SignedJwtsService) {}

  @OnEvent(JWT_CREATED)
  async handleJwtCreated({ jti, sub, exp }: JwtCreatedEvent) {
    await this.signedJwtsService.add({ jti, sub, exp })
  }
}
