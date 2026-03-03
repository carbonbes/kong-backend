import { Entity } from 'redis-om'
import { StoragedJwt } from './storaged-jwt.type'

export interface StoragedJwtSchema extends Entity, StoragedJwt {}
