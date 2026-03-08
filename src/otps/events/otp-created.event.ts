import { Otp } from '@/otps/types'

export class OtpCreatedEvent implements Otp {
  readonly code: Otp['code']
  readonly type: Otp['type']
  readonly email: Otp['email']

  constructor(otp: Otp) {
    this.code = otp.code
    this.type = otp.type
    this.email = otp.email
  }
}
