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
import { User } from '@/users/types'
import { UserGender, UserRole } from '@/users/enums'

export class UserDto implements User {
  @IsInt()
  id: number

  @IsEmail()
  email: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 150)
  name: string

  @IsEnum(UserGender)
  gender: UserGender

  @IsEnum(UserRole)
  role: UserRole

  @IsBoolean()
  isActive: boolean

  @IsDate()
  createdAt: Date

  @IsDate()
  updatedAt: Date
}
