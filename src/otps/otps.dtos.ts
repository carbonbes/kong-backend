import { Otp } from '@/otps/otps.types'
import { IsEnum, IsNumber, IsString, IsUUID, Length } from 'class-validator'
import { OtpType } from '@/otps/otps.enums'
import { Uuid } from '@/shared/types/uuid.type'

export class BaseOtpDto implements Otp {
  @IsUUID()
  id: Uuid

  @IsString()
  @Length(6, 6)
  code: string

  @IsEnum(OtpType)
  type: OtpType

  @IsNumber()
  userId: number
}
