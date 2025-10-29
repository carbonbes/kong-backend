import { SignInDto, SignUpDto, VerifyOtpDto } from './dto'
import { Jwts } from '@/shared/types/jwts'

export type SignUpOptions = SignUpDto
export type SignInOptions = SignInDto
export type VerifyOtpOptions = VerifyOtpDto
export type RotateOptions = Jwts
export type LogoutOptions = Jwts
