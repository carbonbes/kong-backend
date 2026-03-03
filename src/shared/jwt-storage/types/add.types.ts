import { StoragedJwt } from './storaged-jwt.type'

export type AddOptions = StoragedJwt & { exp: number }
export type AddReturn = Promise<StoragedJwt>
