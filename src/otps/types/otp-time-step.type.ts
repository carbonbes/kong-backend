import { Otp } from '@/otps/types'

export type OtpTimeStep = Pick<Otp, 'email'> & { timeStep: number }
