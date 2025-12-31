import { Jwts } from '@/shared/types/jwts'
import { EncodedJwt, JwtPayload } from '@/shared/types'

type Jwt = { jwt: EncodedJwt }

export type SignOptions = Pick<JwtPayload, 'sub'>
export type RevokeOptions = Jwt
export type IsRevokedOptions = Pick<JwtPayload, 'jti'>
export type RotateOptions = Jwts
export type DecodeOptions = Jwt
