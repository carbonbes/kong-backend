import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { SendOtpOptions, SendOtpReturn } from './types'

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOtp({ token, type, email }: SendOtpOptions): SendOtpReturn {
    await this.mailerService.sendMail({
      to: email,

      subject:
        type === 'SIGN_IN'
          ? 'Подтверждение входа'
          : 'Подтверждение регистрации',

      html: `<p>Ваш код подтверждения: ${token}</p>`,
    })
  }
}
