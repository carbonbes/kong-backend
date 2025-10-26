import { JwtPayload } from '@/shared/types/jwt.type'

export type StorageJwt = Pick<JwtPayload, 'jti' | 'sub'>

export type AddOptions = StorageJwt & { exp: number }
export type GetOptions = Pick<StorageJwt, 'jti'>
export type GetAllOptions = Pick<StorageJwt, 'sub'>
export type HasOptions = GetOptions
