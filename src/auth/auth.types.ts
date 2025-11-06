import { SignInDto, SignUpDto, VerifyOtpDto } from './auth.dtos'
import { Response } from 'express'
import { Jwts } from '@/shared/types/jwts'

export type SignUpOptions = SignUpDto
export type SignInOptions = SignInDto
export type VerifyOtpOptions = { otp: VerifyOtpDto; response: Response }
export type RotateOptions = { jwts: Jwts; response: Response }
export type LogoutOptions = { jwts: Jwts; response: Response }
export type SetJwtCookiesOptions = { jwts: Jwts; response: Response }
export type ClearJwtCookiesOptions = { jwts: Jwts; response: Response }
