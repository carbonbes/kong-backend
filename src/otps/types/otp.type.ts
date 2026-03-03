import { Uuid } from '@/shared/uuid/uuid.types'
import { OtpType } from '@/otps/otps.enums'
import { User } from '@/users/types'

export type Otp = {
  id: Uuid
  code: string
  type: OtpType
  userId: User['id']
}
