import { EncodedJwt } from '../../jwts/jwts.types'

export type Uuid = ReturnType<typeof crypto.randomUUID>

export type Credentials = {
  access_token: EncodedJwt
  refresh_token: EncodedJwt
}
