import { SignInDto, SignUpDto, VerifyOtpDto } from './auth.dto'
import { Response } from 'express'
import { Credentials } from '../shared/types/credentials.type'
import { EncodedJwt, JwtPayload, TokenName } from '../shared/types/jwt.type'

export type SignUpOptions = SignUpDto
export type SignInOptions = SignInDto
export type VerifyOtpOptions = VerifyOtpDto
export type RotateOptions = Credentials
export type LogoutOptions = Credentials

export type SetJwtCookieOptions = {
  res: Response
  name: TokenName
  credential: EncodedJwt
}

export type SetJwtsCookieOptions = {
  res: Response
  credentials: Credentials
}

export type GetJwtCookieOptionsOptions = JwtPayload['exp']
