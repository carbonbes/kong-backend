import { JwtPayload } from '@/shared/types'
import { Entity } from 'redis-om'

export type StoragedJwtType = 'signed' | 'revoked'

export type StoragedJwt = Pick<JwtPayload, 'jti' | 'sub'> & {
  typ: StoragedJwtType
}

export interface StoragedJwtSchema extends Entity, StoragedJwt {}

export type AddOptions = StoragedJwt & { exp: number }
export type GetOneOptions = Pick<StoragedJwt, 'jti'>
export type GetAllByUserOptions = Pick<StoragedJwt, 'sub'>
export type HasOptions = GetOneOptions
