import { EncodedJwt } from '@/shared/types'

export type RevokeOptions = EncodedJwt
export type RevokeReturn = Promise<void>
