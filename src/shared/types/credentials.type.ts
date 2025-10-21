import { EncodedJwt } from './jwt.type'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '../consts'

export type Credentials = {
  [ACCESS_TOKEN_NAME]: EncodedJwt
  [REFRESH_TOKEN_NAME]: EncodedJwt
}
