import { IntersectionType, PickType } from '@nestjs/mapped-types'
import { BaseUserDto } from '@/users/users.dto'
import { BaseOtpDto } from '@/otps/otps.dto'
import { CredentialDto } from '@/shared/dtos/credential.dto'

export class SignUpDto extends PickType(BaseUserDto, [
  'email',
  'name',
  'gender',
] as const) {}

export class SignInDto extends PickType(BaseUserDto, ['email'] as const) {}

export class VerifyOtpDto extends IntersectionType(
  PickType(BaseOtpDto, ['otp', 'type'] as const),
  PickType(BaseUserDto, ['email'] as const),
) {}

export class RotateDto extends CredentialDto {}

export class LogoutDto extends CredentialDto {}
