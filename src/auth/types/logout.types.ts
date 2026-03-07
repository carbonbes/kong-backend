import { AuthJwts } from '@/auth-jwts/types/auth-jwts.type'

export type LogoutOptions = AuthJwts
export type LogoutReturn = Promise<void>
