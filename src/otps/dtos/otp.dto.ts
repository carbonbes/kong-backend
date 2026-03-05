import { IsEmail, IsEnum, IsString, Length } from 'class-validator'
import { OtpType } from '@/otps/enums'
import { Otp } from '@/otps/types'

export class OtpDto implements Otp {
  @IsString()
  @Length(6, 6)
  code: string

  @IsEnum(OtpType)
  type: OtpType

  @IsEmail()
  email: string
}
