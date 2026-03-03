import { IsString } from 'class-validator'
import { REFRESH_TOKEN_NAME } from '@/shared/consts'
import { type EncodedJwt } from '@/shared/types'

export class RefreshJwtDto {
  @IsString()
  [REFRESH_TOKEN_NAME]: EncodedJwt
}
