import { PickType } from '@nestjs/mapped-types'
import { UserDto } from '@/users/dtos'

export class SignUpDto extends PickType(UserDto, [
  'email',
  'name',
  'gender',
] as const) {}
