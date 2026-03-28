import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Min,
} from 'class-validator'
import { User } from '@/users/entities'
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

  @IsInt()
  createdAt: number

  @IsInt()
  updatedAt: number
}
