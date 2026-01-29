import { Schema } from 'redis-om'
import { StoragedJwtSchema } from './jwt-storage.types'

export const createSchema = (name: string) =>
  new Schema<StoragedJwtSchema>(
    name,
    {
      jti: { type: 'string' },
      sub: { type: 'number' },
    },
    { dataStructure: 'HASH' },
  )
