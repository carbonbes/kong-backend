import { SignInDto, SignUpDto, VerifyOtpDto } from './auth.dto'
import { EncodedJwt } from '../jwts/jwts.types'

export type SignUpOptions = SignUpDto
export type SignInOptions = SignInDto
export type VerifyOtpOptions = VerifyOtpDto
export type UpdateOptions = EncodedJwt[]
export type LogoutOptions = EncodedJwt[]
