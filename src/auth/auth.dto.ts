import { PickType } from '@nestjs/mapped-types'
import { BaseUserDto } from '@/users/dto'
import { BaseJwtsDto } from '@/jwts/dto'
import { BaseOtpDto } from '@/otps/dto'

export class SignUpDto extends PickType(BaseUserDto, [
  'email',
  'name',
  'gender',
] as const) {}

export class SignInDto extends PickType(BaseUserDto, ['email'] as const) {}

export class VerifyOtpDto extends BaseOtpDto {}

export class RotateDto extends BaseJwtsDto {}

export class LogoutDto extends BaseJwtsDto {}
