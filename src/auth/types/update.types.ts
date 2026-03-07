import { EncodedJwt } from '@/shared/types'
import { AuthJwts } from '@/auth-jwts/types/auth-jwts.type'

export type UpdateOptions = EncodedJwt
export type UpdateReturn = Promise<AuthJwts>
