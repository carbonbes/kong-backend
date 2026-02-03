import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator'
import { User, UserGender } from './users.types'

export class BaseUserDto implements User {
  @IsNumber()
  id: number

  @IsEmail()
  email: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsEnum(UserGender)
  gender: UserGender

  @IsBoolean()
  isActive: boolean

  @IsDate()
  createdAt: Date
}
