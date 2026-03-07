import { Otp } from '@/otps/types'
import { User } from '@/users/types'
import { OtpType } from '@/otps/enums'

export class OtpCreatedEvent implements Otp {
  token: string
  type: OtpType
  email: User['email']

  constructor(otp: Otp) {
    this.token = otp.token
    this.type = otp.type
    this.email = otp.email
  }
}
