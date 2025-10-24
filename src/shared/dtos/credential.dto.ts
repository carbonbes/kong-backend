import { IsUUID } from 'class-validator'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/shared/consts'
import { EncodedJwt } from '@/shared/types/jwt.type'

export class CredentialDto {
  @IsUUID()
  [ACCESS_TOKEN_NAME]: EncodedJwt;

  @IsUUID()
  [REFRESH_TOKEN_NAME]: EncodedJwt
}
