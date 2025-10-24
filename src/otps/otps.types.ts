import { CreateOtpDto, VerifyOtpDto } from './otps.dto'
import { Otp } from '@/otps/otps.entity'
import { PromisifyBoolean } from '@/shared/types/promisify'

export type PromisifyOtp = Promise<Otp>

export type CreateOtpOptions = CreateOtpDto
export type CreateOtpReturn = PromisifyOtp
export type VerifyOtpOptions = VerifyOtpDto
export type VerifyOtpReturn = PromisifyBoolean
