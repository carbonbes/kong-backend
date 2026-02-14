import { PickType } from '@nestjs/mapped-types'
import { BaseUserDto } from '@/users/users.dtos'
import { BaseOtpDto } from '@/otps/otps.dtos'
import { BaseJwtsDto } from '@/jwt/jwt.dtos'

export class SignUpDto extends PickType(BaseUserDto, [
  'email',
  'name',
  'gender',
] as const) {}

export class SignInDto extends PickType(BaseUserDto, ['email'] as const) {}

export class VerifyOtpDto extends BaseOtpDto {}

export class AccessTokenDto extends PickType(BaseJwtsDto, [
  'access_token',
] as const) {}

export class RefreshTokenDto extends PickType(BaseJwtsDto, [
  'refresh_token',
] as const) {}
