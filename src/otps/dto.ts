import { Otp } from '@/otps/types'
import { Uuid } from '@/shared/types/uuid.type'
import { IsEmail, IsEnum, IsString, IsUUID } from 'class-validator'
import { OtpType } from '@/otps/enums'

export class BaseOtpDto implements Otp {
  @IsUUID()
  id: Uuid

  @IsString()
  code: string

  @IsEnum(OtpType)
  type: OtpType

  @IsEmail()
  email: string
}
