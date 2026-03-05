import { OtpDto } from '@/otps/dtos'
import { PickType } from '@nestjs/mapped-types'

export class VerifyOtpDto extends PickType(OtpDto, [
  'code',
  'type',
  'email',
] as const) {}
