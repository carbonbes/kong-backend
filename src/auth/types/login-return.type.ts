import { Otp } from '@/otps/otps.types'
import { User } from '@/users/users.types'

export type LoginReturn = { otpId: Otp['id']; userId: User['id'] }
