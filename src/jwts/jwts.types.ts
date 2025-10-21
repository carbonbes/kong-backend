import { Credentials, EncodedJwt, JwtPayload } from '../shared/types'

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
export type RotateOptions = Credentials
