import { Injectable } from '@nestjs/common'
import { MailService } from '@/mail/mail.service'
import { OnEvent } from '@nestjs/event-emitter'
import type { OtpCreatedEvent } from '@/otps/events'
import { OTP_CREATED } from '@/otps/consts'

@Injectable()
export class OtpCreatedListener {
  constructor(private readonly mailService: MailService) {}

  @OnEvent(OTP_CREATED)
  async handleOtpCreated({ email, code, type }: OtpCreatedEvent) {
    await this.mailService.sendOtp({ email, code, type })
  }
}
