import { JwtPayload } from '@/shared/types'

export type StoragedJwt = Pick<JwtPayload, 'jti' | 'sub'>
