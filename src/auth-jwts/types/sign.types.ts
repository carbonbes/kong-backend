import { JwtPayload } from '@/shared/types'
import { AuthJwts } from './auth-jwts.type'

export type SignOptions = Pick<JwtPayload, 'sub'>
export type SignReturn = Promise<AuthJwts>
