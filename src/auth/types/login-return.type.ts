import { Otp } from '@/otps/types'
import { User } from '@/users/types'

export type LoginReturn = { otpId: Otp['id']; userId: User['id'] }
