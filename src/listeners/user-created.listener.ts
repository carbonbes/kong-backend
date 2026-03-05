import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { OtpsService } from '@/otps/otps.service'
import type { UserCreatedEvent } from '@/events/user-created/user-created.event'
import { USER_CREATED } from '@/events/user-created/consts'
import { OtpType } from '@/otps/enums'

@Injectable()
export class OtpCreatedListener {
  constructor(private readonly otpsService: OtpsService) {}

  @OnEvent(USER_CREATED)
  async handleUserCreated({ email }: UserCreatedEvent) {
    await this.otpsService.create({ type: OtpType.SIGN_UP, email })
  }
}
