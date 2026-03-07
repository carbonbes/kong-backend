import { EncodedJwt } from '@/shared/types'
import { AuthJwts } from './auth-jwts.type'

export type RotateOptions = EncodedJwt
export type RotateReturn = Promise<AuthJwts>
