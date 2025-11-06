import { PickType } from '@nestjs/mapped-types'
import { BaseUserDto } from '@/users/users.dtos'
import { BaseOtpDto } from '@/otps/otps.dtos'

export class SignUpDto extends PickType(BaseUserDto, [
  'email',
  'name',
  'gender',
] as const) {}

export class SignInDto extends PickType(BaseUserDto, ['email'] as const) {}

export class VerifyOtpDto extends BaseOtpDto {}
