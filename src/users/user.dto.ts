import { User } from './user.entity'
import { UserGender } from './user.interface'
import { PartialType, PickType } from '@nestjs/mapped-types'
import { IsDate, IsEmail, IsEnum, IsNumber, IsString } from 'class-validator'
import { Exclude, Expose } from 'class-transformer'

class BaseUserDto implements User {
  @IsNumber()
  @Expose()
  id: number

  @IsString()
  @Expose()
  name: string

  @IsEmail()
  @Exclude()
  email: string

  @IsEnum(UserGender)
  @Expose()
  gender: UserGender

  @IsDate()
  @Expose()
  createdAt: Date
}

export class CreateUserDto extends PickType(BaseUserDto, [
  'name',
  'email',
  'gender',
] as const) {}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UserResponseDto extends BaseUserDto {}
