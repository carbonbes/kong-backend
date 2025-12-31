import { JwtPayload } from '@/shared/types'
import { Entity } from 'redis-om'

export type StoragedJwt = Pick<JwtPayload, 'jti' | 'sub'>

export interface StoragedJwtSchema extends Entity, StoragedJwt {}

export type AddOptions = StoragedJwt & { exp: number }
export type GetOptions = Pick<StoragedJwt, 'jti'>
export type GetAllOptions = Pick<StoragedJwt, 'sub'>
export type HasOptions = GetOptions
