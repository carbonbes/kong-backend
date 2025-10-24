import { Credentials } from '@/shared/types/credentials.type'
import { EncodedJwt, JwtPayload } from '@/shared/types/jwt.type'
import { PromisifyCredentials } from '@/shared/types/promisify'

export type GetPayloadOptions = JwtPayload['sub']
export type GetSignOptionsOptions = 'access' | 'refresh'

export type SignJwtOptions = {
  sub: JwtPayload['sub']
  type: 'access' | 'refresh'
}

export type SignOptions = JwtPayload['sub']
export type SignReturn = PromisifyCredentials
export type RevokeOptions = EncodedJwt
export type IsRevokedOptions = JwtPayload['jti']
export type RotateOptions = Credentials
export type DecodeOptions = EncodedJwt
