import { Jwts } from '@/shared/types/jwts'
import { EncodedJwt, JwtPayload } from '@/shared/types/jwt.type'

export type GetPayloadOptions = JwtPayload['sub']
export type GetSignOptionsOptions = 'access' | 'refresh'

export type SignJwtOptions = {
  sub: JwtPayload['sub']
  type: 'access' | 'refresh'
}

export type SignOptions = JwtPayload['sub']
export type RevokeOptions = EncodedJwt
export type IsRevokedOptions = Pick<JwtPayload, 'jti'>
export type RotateOptions = Jwts
export type DecodeOptions = EncodedJwt
