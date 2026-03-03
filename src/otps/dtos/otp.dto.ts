import { IsEnum, IsNumber, IsString, IsUUID, Length } from 'class-validator'
import { type Uuid } from '@/shared/uuid/types'
import { OtpType } from '@/otps/enums'
import { Otp } from '@/otps/types'

export class OtpDto implements Otp {
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
