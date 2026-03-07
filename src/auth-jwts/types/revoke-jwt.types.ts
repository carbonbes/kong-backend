import { EncodedJwt } from '@/shared/types'

export type RevokeJwtOptions = EncodedJwt
export type RevokeJwtReturn = Promise<void>
