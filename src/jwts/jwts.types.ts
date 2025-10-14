import { Uuid } from '../shared/types'

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

export type GetPayloadOptions = JwtPayload['sub']
export type GetSignOptionsOptions = 'access' | 'refresh'

export type SignJwtOptions = {
  sub: JwtPayload['sub']
  type: 'access' | 'refresh'
}

export type SignOptions = JwtPayload['sub']
export type DecodeOptions = EncodedJwt
export type RevokeOptions = EncodedJwt
export type IsRevokedOptions = JwtPayload['jti']
export type RotateOptions = EncodedJwt[]
