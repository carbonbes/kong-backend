import { Uuid } from '../shared/types'

export type JwtPayload = {
  jti: Uuid
  sub: number
}
