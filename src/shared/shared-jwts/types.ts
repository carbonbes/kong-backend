import { User } from '@/users/types'

type Sub = { sub: User['id'] }

export type Type = 'access' | 'refresh'

export type SignOptions = Sub
export type GetPayloadOptions = Sub
