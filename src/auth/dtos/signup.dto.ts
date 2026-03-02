import { PickType } from '@nestjs/mapped-types'
import { UserDto } from '@/users/users.dtos'

export class SignUpDto extends PickType(UserDto, [
  'email',
  'name',
  'gender',
] as const) {}
