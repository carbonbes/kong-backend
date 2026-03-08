import { OtpType } from '@/otps/enums'
import { User } from '@/users/types'

export type Otp = {
  code: string
  type: OtpType
  email: User['email']
}
