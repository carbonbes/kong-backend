import { JwtPayload } from '@/shared/types'
import { AuthJwts } from '@/auth/types/auth-jwts.type'

export type SignJwtsOptions = Pick<JwtPayload, 'sub'>
export type SignJwtsReturn = Promise<AuthJwts>
