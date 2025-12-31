import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/shared/consts'
import { EncodedJwt } from '@/shared/types'

export type Jwts = {
  [ACCESS_TOKEN_NAME]: EncodedJwt
  [REFRESH_TOKEN_NAME]: EncodedJwt
}
