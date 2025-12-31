import { Uuid } from '@/shared/types'

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

export type EncodedJwt = `${string}.${string}.${string}`
