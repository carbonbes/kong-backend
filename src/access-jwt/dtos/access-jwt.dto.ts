import { IsString } from 'class-validator'
import { ACCESS_TOKEN_NAME } from '@/shared/consts'
import { type EncodedJwt } from '@/shared/types'

export class AccessJwtDto {
  @IsString()
  [ACCESS_TOKEN_NAME]: EncodedJwt
}
