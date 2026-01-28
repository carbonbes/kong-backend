import { SignInDto, SignUpDto, VerifyOtpDto } from './auth.dtos'
import { Jwts } from '@/jwts/jwts.types'
import { Otp } from '@/otps/otps.types'
import { User } from '@/users/users.types'

export type LoginReturn = { otpId: Otp['id']; userId: User['id'] } | null

export type SignUpOptions = SignUpDto
export type SignUpReturn = Promise<LoginReturn>

export type SignInOptions = SignInDto
export type SignInReturn = Promise<LoginReturn>

export type VerifyOtpOptions = VerifyOtpDto

export type RotateOptions = Jwts

export type LogoutOptions = Jwts
