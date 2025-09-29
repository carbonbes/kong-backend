import { User } from '../entity'
import { UserGender } from '../enum'
import { PartialType, PickType } from '@nestjs/mapped-types'
import { IsDate, IsEmail, IsEnum, IsNumber, IsString } from 'class-validator'
import { Expose } from 'class-transformer'

class BaseUserDto implements User {
  @IsNumber()
  id: number

  @IsEmail()
  email: string

  @IsString()
  name: string

  @IsEnum(UserGender)
  gender: UserGender

  @IsDate()
  createdAt: Date
}

export class CreateUserDto extends PickType(BaseUserDto, [
  'email',
  'name',
  'gender',
] as const) {}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UserResponseDto implements User {
  @Expose()
  id: number

  @Expose({ groups: ['owner', 'admin'] })
  email: string

  @Expose()
  name: string

  @Expose()
  gender: UserGender

  @Expose()
  createdAt: Date
}
