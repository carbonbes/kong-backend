import { Credentials } from '../shared/types/credentials.type'
import { EncodedJwt, JwtPayload } from '../shared/types/jwt.type'

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
