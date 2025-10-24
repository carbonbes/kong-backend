import { Otp } from './otp.entity'
import { OtpType } from './otp.enum'
import { User } from '../users/user.entity'
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { IntersectionType, PickType } from '@nestjs/mapped-types'
import { BaseUserDto } from '../users/user.dto'

export class BaseOtpDto implements Otp {
  @IsNumber()
  id: number

  @IsString()
  @Length(6, 6)
  otp: string

  @IsEnum(OtpType)
  type: OtpType

  @ValidateNested()
  @Type(() => User)
  user: User

  @IsDate()
  createdAt: Date

  @IsDate()
  expiresAt: Date
}

export class CreateOtpDto extends PickType(BaseOtpDto, [
  'otp',
  'type',
  'user',
  'expiresAt',
] as const) {}

export class VerifyOtpDto extends IntersectionType(
  PickType(BaseOtpDto, ['otp', 'type'] as const),
  PickType(BaseUserDto, ['email'] as const),
) {}
