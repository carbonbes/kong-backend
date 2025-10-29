import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { SendOtpOptions } from './types'

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  sendOtp({ email, code, type }: SendOtpOptions) {
    return this.mailerService.sendMail({
      to: email,

      subject:
        type === 'SIGN_IN'
          ? 'Подтверждение входа'
          : 'Подтверждение регистрации',

      html: `<p>Ваш код подтверждения: ${code}</p>`,
    })
  }
}
