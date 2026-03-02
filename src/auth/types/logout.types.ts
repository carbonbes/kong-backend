import { AuthJwts } from '@/auth/types/auth-jwts.type'

export type LogoutOptions = AuthJwts
export type LogoutReturn = Promise<void>
