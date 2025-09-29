import { Otp } from '../entity'

export type VerifyOtpInput = Pick<Otp, 'otp' | 'type' | 'user'>
