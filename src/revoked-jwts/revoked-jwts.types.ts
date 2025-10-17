import { JwtPayload } from '../shared/types'

export type AddOptions = { jti: JwtPayload['jti']; exp: JwtPayload['exp'] }
export type GetOptions = JwtPayload['jti']
export type HasOptions = JwtPayload['jti']
