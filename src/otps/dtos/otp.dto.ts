import { IsEmail, IsEnum, IsString, Length } from 'class-validator'
import { Otp } from '@/otps/types'
import { OtpType } from '@/otps/enums'

export class OtpDto implements Otp {
  @IsString()
  @Length(6, 6)
  token: string

  @IsEnum(OtpType)
  type: OtpType

  @IsEmail()
  email: string
}
