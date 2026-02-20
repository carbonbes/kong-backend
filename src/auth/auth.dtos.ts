import { PickType } from '@nestjs/mapped-types'
import { UserDto } from '@/users/users.dtos'
import { OtpDto } from '@/otps/otps.dtos'
import { AuthJwtsDto } from '@/auth-jwts/auth-jwts.dtos'

export class SignUpDto extends PickType(UserDto, [
  'email',
  'name',
  'gender',
] as const) {}

export class SignInDto extends PickType(UserDto, ['email'] as const) {}

export class VerifyOtpDto extends OtpDto {}

export class AccessTokenDto extends PickType(AuthJwtsDto, [
  'accessToken',
] as const) {}

export class RefreshTokenDto extends PickType(AuthJwtsDto, [
  'refreshToken',
] as const) {}
