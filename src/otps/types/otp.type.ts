import { User } from '@/users/types'
import { OtpType } from '@/otps/enums'

export type Otp = {
  token: string
  type: OtpType
  email: User['email']
}
