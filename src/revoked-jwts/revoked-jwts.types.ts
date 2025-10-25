import { JwtPayload } from '@/shared/types/jwt.type'
import { Entity } from 'redis-om'

export interface RevokedJwt
  extends Entity,
    Pick<JwtPayload, 'jti' | 'sub' | 'exp'> {}

export type AddOptions = Pick<JwtPayload, 'jti' | 'sub' | 'exp'>
export type GetOptions = Pick<JwtPayload, 'jti' | 'sub'>
export type GetAllOptions = Pick<JwtPayload, 'sub'>
