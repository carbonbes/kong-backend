import { Otp } from '@/otps/types'
import { IsEnum, IsNumber, IsString, IsUUID, Length } from 'class-validator'
import { OtpType } from '@/otps/enums'

export class BaseOtpDto implements Otp {
  @IsUUID()
  id: string

  @IsString()
  @Length(6, 6)
  code: string

  @IsEnum(OtpType)
  type: OtpType

  @IsNumber()
  userId: number
}
