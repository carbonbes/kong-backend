import { StoragedJwt } from './storaged-jwt.type'

export type GetOneOptions = Pick<StoragedJwt, 'jti'>
export type GetOneReturn = Promise<StoragedJwt | null>
