import { User } from '../entity'
import { UserGender } from '../enum'
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator'
import { Expose } from 'class-transformer'

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

export class UserResponseDto implements User {
  @Expose()
  id: number

  @Expose({ groups: ['owner', 'admin'] })
  email: string

  @Expose()
  name: string

  @Expose()
  gender: UserGender

  @Expose({ groups: ['owner', 'admin'] })
  isActive: boolean

  @Expose()
  createdAt: Date
}
