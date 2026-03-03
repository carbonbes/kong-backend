import { User } from '@/users/types'
import { EncodedJwt } from '@/shared/types'

export type SignOptions = { sub: User['id'] }
export type SignReturn = EncodedJwt
