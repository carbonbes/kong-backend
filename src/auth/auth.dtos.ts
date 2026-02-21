import { PickType } from '@nestjs/mapped-types'
import { UserDto } from '@/users/users.dtos'
import { OtpDto } from '@/otps/otps.dtos'
import { IsString } from 'class-validator'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/shared/consts'
import { EncodedJwt } from '@/shared/types'

export class SignUpDto extends PickType(UserDto, [
  'email',
  'name',
  'gender',
] as const) {}

export class SignInDto extends PickType(UserDto, ['email'] as const) {}

export class VerifyOtpDto extends OtpDto {}

export class AccessTokenDto {
  @IsString()
  [ACCESS_TOKEN_NAME]: EncodedJwt
}

export class RefreshTokenDto {
  @IsString()
  [REFRESH_TOKEN_NAME]: EncodedJwt
}
