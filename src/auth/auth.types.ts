import { SignInDto, SignUpDto, VerifyOtpDto } from './auth.dto'
import { Response } from 'express'
import {
  AccessTokenName,
  EncodedJwt,
  JwtPayload,
  RefreshTokenName,
} from '../shared/types'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '../shared/consts'

export type SignUpOptions = SignUpDto
export type SignInOptions = SignInDto
export type VerifyOtpOptions = VerifyOtpDto
export type UpdateOptions = EncodedJwt[]
export type LogoutOptions = EncodedJwt[]

export type SetJwtCookieOptions = {
  res: Response
  name: AccessTokenName | RefreshTokenName
  jwt: EncodedJwt
}

export type SetJwtsCookieOptions = {
  res: Response
  jwts: {
    [ACCESS_TOKEN_NAME]: EncodedJwt
    [REFRESH_TOKEN_NAME]: EncodedJwt
  }
}

export type GetJwtCookieOptionsOptions = JwtPayload['exp']
