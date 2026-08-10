import { IntersectionType, PickType } from '@nestjs/mapped-types'
import { UserDto } from '@/users/dtos'
import { OtpDto } from '@/otps/dtos'

export class ResendOtpDto extends IntersectionType(
  PickType(UserDto, ['email'] as const),
  PickType(OtpDto, ['type'] as const),
) {}
