import { IsEmail, IsEnum, IsString, IsUUID, Length } from 'class-validator'
import { OtpType } from '@/otps/enums'
import { Otp } from '@/otps/types'
import { type Uuid } from '@/shared/uuid/types'

export class OtpDto implements Otp {
  @IsUUID()
  id: Uuid

  @IsString()
  @Length(6, 6)
  code: string

  @IsEnum(OtpType)
  type: OtpType

  @IsEmail()
  email: string
}
