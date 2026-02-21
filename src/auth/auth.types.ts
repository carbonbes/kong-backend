import { SignInDto, SignUpDto, VerifyOtpDto } from './auth.dtos'
import { Otp } from '@/otps/otps.types'
import { User } from '@/users/users.types'
import { EncodedJwt, JwtPayload } from '@/shared/types'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/shared/consts'

export type LoginReturn = { otpId: Otp['id']; userId: User['id'] }
export type AuthJwts = {
  [ACCESS_TOKEN_NAME]: EncodedJwt
  [REFRESH_TOKEN_NAME]: EncodedJwt
}

export type SignUpOptions = SignUpDto
export type SignUpReturn = Promise<LoginReturn>

export type SignInOptions = SignInDto
export type SignInReturn = Promise<LoginReturn>

export type VerifyOtpOptions = VerifyOtpDto
export type VerifyOtpReturn = Promise<AuthJwts>

export type UpdateOptions = EncodedJwt

export type LogoutOptions = AuthJwts

export type SignJwtsOptions = Pick<JwtPayload, 'sub'>
export type SignJwtsReturn = Promise<AuthJwts>

export type RevokeJwtOptions = {
  jwt: EncodedJwt
  type: typeof ACCESS_TOKEN_NAME | typeof REFRESH_TOKEN_NAME
}

export type RevokeJwtsOptions = AuthJwts

export type RotateJwtsOptions = EncodedJwt
export type RotateJwtsReturn = Promise<AuthJwts>
