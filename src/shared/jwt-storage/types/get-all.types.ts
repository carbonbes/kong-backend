import { StoragedJwt } from './storaged-jwt.type'

export type GetAllOptions = Pick<StoragedJwt, 'sub'>
export type GetAllReturn = Promise<StoragedJwt[]>
