import { SignInDto, SignUpDto, VerifyOtpDto } from './auth.dto'
import { Credentials } from '@/shared/types/credentials.type'

export type SignUpOptions = SignUpDto
export type SignInOptions = SignInDto
export type VerifyOtpOptions = VerifyOtpDto
export type RotateOptions = Credentials
export type LogoutOptions = Credentials
