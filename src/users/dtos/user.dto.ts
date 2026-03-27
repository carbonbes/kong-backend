import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator'
import { User } from '@/users/entities'
import { UserGender, UserRole } from '@/users/enums'

export class UserDto implements User {
  @IsInt()
  id: number

  @IsEmail()
  @Length(1, 100)
  email: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string

  @IsEnum(UserGender)
  gender: UserGender

  @IsEnum(UserRole)
  role: UserRole

  @IsBoolean()
  isActive: boolean

  @IsDate()
  createdAt: number

  @IsDate()
  updatedAt: number
}
