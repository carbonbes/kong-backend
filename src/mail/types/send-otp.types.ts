import { Otp } from '@/otps/types'
import { User } from '@/users/entities'

export type SendOtpOptions = Pick<User, 'email'> & Pick<Otp, 'code' | 'type'>
export type SendOtpReturn = Promise<void>
