import { Otp } from '@/otps/types'
import { User } from '@/users/types'

export type SendOtpOptions = Pick<Otp, 'token' | 'type'> & Pick<User, 'email'>
export type SendOtpReturn = Promise<void>
