import { EncodedJwt, JwtPayload } from '@/shared/types'

export type SignOptions = Pick<JwtPayload, 'sub'>
export type SignReturn = EncodedJwt
