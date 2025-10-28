import { JwtPayload } from '@/shared/types/jwt.type'
import { Entity } from 'redis-om'

export type StorageJwt = Pick<JwtPayload, 'jti' | 'sub'>

export interface StorageJwtSchema extends Entity, StorageJwt {}

export type AddOptions = StorageJwt & { exp: number }
export type GetOptions = Pick<StorageJwt, 'jti'>
export type GetAllOptions = Pick<StorageJwt, 'sub'>
export type HasOptions = GetOptions
