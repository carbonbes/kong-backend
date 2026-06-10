import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Min,
} from 'class-validator'
import { User } from '@/users/types'
import { UserGender, UserRole } from '@/users/enums'

export class UserDto implements User {
  @IsInt()
  @Min(1)
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
  createdAt: Date

  @IsDate()
  updatedAt: Date
}
