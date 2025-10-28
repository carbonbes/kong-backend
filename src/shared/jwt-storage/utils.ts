import { Schema } from 'redis-om'
import { StorageJwtSchema } from '@/shared/jwt-storage/types'

export const createSchema = (name: string) =>
  new Schema<StorageJwtSchema>(
    name,
    {
      jti: { type: 'string' },
      sub: { type: 'number' },
    },
    { dataStructure: 'HASH' },
  )
