import { SignInDto, SignUpDto, VerifyOtpDto } from './auth.dto'
import { EncodedJwt } from '../jwts/jwts.types'
import { Credentials } from '../shared/types'
import { Response } from 'express'

export type SignUpOptions = SignUpDto
export type SignInOptions = SignInDto
export type VerifyOtpOptions = VerifyOtpDto
export type UpdateOptions = EncodedJwt[]
export type LogoutOptions = EncodedJwt[]

export type SetCredentialsCookieOptions = {
  credentials: Credentials
  res: Response
}
