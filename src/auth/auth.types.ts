import { SignInDto, SignUpDto, VerifyOtpDto } from './auth.dtos'
import { AuthJwts } from '@/auth-jwts/auth-jwts.types'
import { Otp } from '@/otps/otps.types'
import { User } from '@/users/users.types'
import { EncodedJwt } from '@/shared/types'

export type LoginReturn = { otpId: Otp['id']; userId: User['id'] }

export type SignUpOptions = SignUpDto
export type SignUpReturn = Promise<LoginReturn>

export type SignInOptions = SignInDto
export type SignInReturn = Promise<LoginReturn>

export type VerifyOtpOptions = VerifyOtpDto

export type UpdateOptions = EncodedJwt

export type LogoutOptions = AuthJwts
