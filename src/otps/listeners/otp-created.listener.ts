import { Injectable } from '@nestjs/common'
import { MailService } from '@/mail/mail.service'
import { OnEvent } from '@nestjs/event-emitter'
import type { OtpCreatedEvent } from '@/otps/events/otp-created.event'
import { OTP_CREATED } from '@/otps/consts'

@Injectable()
export class OtpCreatedListener {
  constructor(private readonly mailService: MailService) {}

  @OnEvent(OTP_CREATED)
  async handleOtpCreated({ token, type, email }: OtpCreatedEvent) {
    await this.mailService.sendOtp({ token, type, email })
  }
}
