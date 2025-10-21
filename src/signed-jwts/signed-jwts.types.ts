import { JwtPayload } from '../shared/types'

export type AddOptions = Pick<JwtPayload, 'jti' | 'sub' | 'exp'>
export type GetOptions = Pick<JwtPayload, 'sub'> & { field: string }
export type GetAllOptions = Pick<JwtPayload, 'sub'>
