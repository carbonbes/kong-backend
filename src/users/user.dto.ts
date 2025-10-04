import { User } from './user.entity'
import { UserGender } from './user.enum'
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator'
import { PartialType, PickType } from '@nestjs/mapped-types'

export class BaseUserDto implements User {
  @IsNumber()
  id: number

  @IsEmail()
  email: string

  @IsString()
  name: string

  @IsEnum(UserGender)
  gender: UserGender

  @IsBoolean()
  isActive: boolean

  @IsDate()
  createdAt: Date
}

export class CreateUserDto extends PickType(BaseUserDto, [
  'email',
  'name',
  'gender',
] as const) {}

export class FindOneUserByDto extends PartialType(BaseUserDto) {}

export class ActivateUserDto extends PickType(BaseUserDto, [
  'email',
] as const) {}
