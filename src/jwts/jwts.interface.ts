import { Uuid } from '../shared/types'
import { JwtSignOptions } from '@nestjs/jwt'

export type JwtHeader = {
  alg: 'HS256'
  typ: 'JWT'
}

export type JwtPayload = {
  jti: Uuid
  sub: number
  iat: number
  exp: number
}

export type JwtOptions = JwtSignOptions

export type DecodedJwt = JwtHeader & JwtPayload
