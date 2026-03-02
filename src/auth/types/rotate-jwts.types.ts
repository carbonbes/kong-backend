import { EncodedJwt } from '@/shared/types'
import { AuthJwts } from '@/auth/types/auth-jwts.type'

export type RotateJwtsOptions = EncodedJwt
export type RotateJwtsReturn = Promise<AuthJwts>
