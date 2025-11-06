import { IsString } from 'class-validator'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/shared/consts'
import { EncodedJwt } from '@/shared/types/jwt.type'

export class BaseJwtsDto {
  @IsString()
  [ACCESS_TOKEN_NAME]: EncodedJwt;

  @IsString()
  [REFRESH_TOKEN_NAME]: EncodedJwt
}
