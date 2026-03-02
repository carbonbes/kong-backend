import { EncodedJwt } from '@/shared/types'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/shared/consts'

export type RevokeJwtOptions = {
  jwt: EncodedJwt
  type: typeof ACCESS_TOKEN_NAME | typeof REFRESH_TOKEN_NAME
}
export type RevokeJwtReturn = Promise<void>
