import { EncodedJwt, JwtPayload } from '@/shared/types'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/shared/consts'

export type AuthJwts = {
  [ACCESS_TOKEN_NAME]: EncodedJwt
  [REFRESH_TOKEN_NAME]: EncodedJwt
}

export type SignOptions = Pick<JwtPayload, 'sub'>
export type RevokeOptions = EncodedJwt
export type IsRevokedOptions = Pick<JwtPayload, 'jti'>
export type RotateOptions = EncodedJwt
export type DecodeOptions = EncodedJwt
