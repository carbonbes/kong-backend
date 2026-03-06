import { Otp } from '@/otps/types'
import { User } from '@/users/types'
import { Uuid } from '@/shared/uuid/types'
import { OtpType } from '@/otps/enums'

export class OtpCreatedEvent implements Otp {
  id: Uuid
  code: string
  type: OtpType
  email: User['email']

  constructor(otp: Otp) {
    this.id = otp.id
    this.code = otp.code
    this.type = otp.type
    this.email = otp.email
  }
}
