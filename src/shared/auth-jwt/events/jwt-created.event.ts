import { EncodedJwt, JwtPayload } from '@/shared/types'
import { getDecodedJwt } from '@/shared/utils'

export class JwtCreatedEvent implements JwtPayload {
  readonly jti: JwtPayload['jti']
  readonly sub: JwtPayload['sub']
  readonly iat: JwtPayload['iat']
  readonly exp: JwtPayload['exp']

  constructor(jwt: EncodedJwt) {
    const { jti, sub, iat, exp } = getDecodedJwt(jwt)

    this.jti = jti
    this.sub = sub
    this.iat = iat
    this.exp = exp
  }
}
