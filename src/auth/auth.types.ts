import { SignInDto, SignUpDto, VerifyOtpDto } from './auth.dto'
import { Credentials } from '@/shared/types/credentials.type'
import { Otp } from '@/otps/otps.entity'

export type SignUpOptions = SignUpDto
export type SignUpReturn = Promise<Otp>
export type SignInOptions = SignInDto
export type SignInReturn = Promise<Otp>
export type VerifyOtpOptions = VerifyOtpDto
export type RotateOptions = Credentials
export type LogoutOptions = Credentials
