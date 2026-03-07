import { EncodedJwt } from '@/shared/types'
import { Uuid } from '@/shared/uuid/types'
import { User } from '@/users/types'
import { getDecodedJwt } from '@/shared/utils'

export class JwtCreatedEvent {
  jti: Uuid
  sub: User['email']
  iat: number
  exp: number

  constructor(jwt: EncodedJwt) {
    const { jti, sub, iat, exp } = getDecodedJwt(jwt)

    this.jti = jti
    this.sub = sub
    this.iat = iat
    this.exp = exp
  }
}
