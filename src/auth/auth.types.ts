import { SignInDto, SignUpDto, VerifyOtpDto } from './auth.dtos'
import { Response } from 'express'
import { Jwts } from '@/shared/types/jwts'
import { Otp } from '@/otps/otps.types'
import { User } from '@/users/users.types'

export type LoginReturn = { otpId: Otp['id']; userId: User['id'] } | undefined
export type JwtCookiesHandlerOptions = { jwts: Jwts; response: Response }

export type SignUpOptions = SignUpDto
export type SignUpReturn = Promise<LoginReturn>

export type SignInOptions = SignInDto
export type SignInReturn = Promise<LoginReturn>

export type VerifyOtpOptions = VerifyOtpDto
export type VerifyOtpReturn = Promise<Jwts>

export type RotateOptions = Jwts
export type RotateReturn = Promise<Jwts>

export type SetJwtCookiesOptions = JwtCookiesHandlerOptions
export type ClearJwtCookiesOptions = JwtCookiesHandlerOptions
