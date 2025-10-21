import { Uuid } from './uuid.type'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '../consts'

export type AccessTokenName = typeof ACCESS_TOKEN_NAME
export type RefreshTokenName = typeof REFRESH_TOKEN_NAME
export type TokenName = AccessTokenName | RefreshTokenName

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
