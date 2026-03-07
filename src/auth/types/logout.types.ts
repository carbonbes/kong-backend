import { EncodedJwt } from '@/shared/types'

export type LogoutOptions = EncodedJwt
export type LogoutReturn = Promise<void>
