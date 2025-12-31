import { SignInDto, SignUpDto, VerifyOtpDto } from './auth.dtos'
import { Response } from 'express'
import { Jwts } from '@/shared/types/jwts'
import { Otp } from '@/otps/otps.types'
import { User } from '@/users/users.types'

export type LoginReturn = { otpId: Otp['id']; userId: User['id'] } | null
export type JwtCookiesHandlerOptions = { jwts: Jwts; res: Response }

export type SignUpOptions = SignUpDto
export type SignUpReturn = Promise<LoginReturn>

export type SignInOptions = SignInDto
export type SignInReturn = Promise<LoginReturn>

export type VerifyOtpOptions = { body: VerifyOtpDto; res: Response }

export type RotateOptions = { jwts: Jwts; res: Response }

export type LogoutOptions = { jwts: Jwts; res: Response }

export type SetJwtCookiesOptions = JwtCookiesHandlerOptions
export type ClearJwtCookiesOptions = JwtCookiesHandlerOptions
