import { Schema } from 'redis-om'
import { StoragedJwtSchema } from '@/jwt-storage/jwt-storage.types'

export const jwtStorageSchema = new Schema<StoragedJwtSchema>(
  'jwt-storage',
  {
    jti: { type: 'string' },
    sub: { type: 'number' },
    typ: { type: 'string' },
  },
  { dataStructure: 'HASH' },
)
