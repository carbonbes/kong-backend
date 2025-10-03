import { User } from '../../users/entity'
import { SignInDto, SignUpDto, VerifyOtpDto } from '../dto'

export type JwtPayload = { sub: User['id']; user: User }

export type AccessJwtPayload = JwtPayload & {
  type: 'access_token'
}

export type RefreshJwtPayload = JwtPayload & {
  type: 'refresh_token'
}

export type SignJwtInput = Pick<User, 'email'>
export type SignUpInput = SignUpDto
export type SignInInput = SignInDto
export type VerifyOtpInput = VerifyOtpDto
