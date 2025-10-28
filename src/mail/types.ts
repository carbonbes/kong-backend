import { Otp } from '@/otps/types'
import { User } from '@/users/types'

export type SendOtpOptions = Pick<User, 'email'> & Pick<Otp, 'code' | 'type'>
