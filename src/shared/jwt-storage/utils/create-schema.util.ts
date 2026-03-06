import { Schema } from 'redis-om'
import { StoragedJwt } from '../types'

export const createSchema = (name: string) =>
  new Schema<StoragedJwt>(
    name,
    {
      jti: { type: 'string' },
      sub: { type: 'string' },
    },
    { dataStructure: 'HASH' },
  )
