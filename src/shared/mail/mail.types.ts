import { Otp } from '@/otps/otps.types'
import { User } from '@/users/users.types'

export type SendOtpOptions = Pick<User, 'email'> & Pick<Otp, 'code' | 'type'>
