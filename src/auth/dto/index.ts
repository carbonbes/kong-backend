import { PickType } from '@nestjs/mapped-types'
import { BaseUserDto } from '../../users/dto'

export class SignUpDto extends PickType(BaseUserDto, [
  'email',
  'name',
  'gender',
] as const) {}

export class SignInDto extends PickType(BaseUserDto, ['email'] as const) {}
