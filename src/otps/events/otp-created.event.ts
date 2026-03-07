import { Otp } from '@/otps/types'

export class OtpCreatedEvent implements Otp {
  readonly id: Otp['id']
  readonly code: Otp['code']
  readonly type: Otp['type']
  readonly email: Otp['email']

  constructor(otp: Otp) {
    this.id = otp.id
    this.code = otp.code
    this.type = otp.type
    this.email = otp.email
  }
}
