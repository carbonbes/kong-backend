import { Uuid } from '@/shared/uuid/types'
import { OtpType } from '@/otps/enums'
import { User } from '@/users/types'

export type Otp = {
  id: Uuid
  code: string
  type: OtpType
  email: User['email']
}
