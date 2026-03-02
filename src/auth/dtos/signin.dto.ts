import { PickType } from '@nestjs/mapped-types'
import { UserDto } from '@/users/users.dtos'

export class SignInDto extends PickType(UserDto, ['email'] as const) {}
