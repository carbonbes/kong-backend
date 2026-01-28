import { EncodedJwt, JwtPayload } from '@/shared/types'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/shared/consts'

export type Jwts = {
  [ACCESS_TOKEN_NAME]: EncodedJwt
  [REFRESH_TOKEN_NAME]: EncodedJwt
}

type Jwt = { jwt: EncodedJwt }

export type JwtsModuleOptions = {
  accessTokenSecret: string
  accessTokenExpiresIn: number
  refreshTokenSecret: string
  refreshTokenExpiresIn: number
}

export type SignOptions = Pick<JwtPayload, 'sub'>
export type RevokeOptions = Jwt
export type IsRevokedOptions = Pick<JwtPayload, 'jti'>
export type RotateOptions = Jwts
export type DecodeOptions = Jwt
export type SignJwtOptions = Pick<JwtPayload, 'sub'> & {
  type: 'access_token' | 'refresh_token'
}
