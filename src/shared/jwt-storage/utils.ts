import { Schema } from 'redis-om'
import { StorageJwt } from '@/shared/jwt-storage/types'

export const createSchema = (name: string) =>
  new Schema<StorageJwt>(
    name,
    {
      jti: { type: 'string' },
      sub: { type: 'number' },
    },
    { dataStructure: 'HASH' },
  )
