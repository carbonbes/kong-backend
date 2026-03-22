import { OtpType } from '@/otps/enums'
import { User } from '@/users/entities'

export type Otp = {
  code: string
  type: OtpType
  email: User['email']
}
