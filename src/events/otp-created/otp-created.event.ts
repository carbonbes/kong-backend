import { OtpType } from '@/otps/enums'
import { Otp } from '@/otps/types'
import { User } from '@/users/types'

export class OtpCreatedEvent {
  readonly email: User['email']
  readonly code: Otp['code']
  readonly type: OtpType

  constructor(email: User['email'], code: Otp['code'], type: OtpType) {
    this.email = email
    this.code = code
    this.type = type
  }
}
