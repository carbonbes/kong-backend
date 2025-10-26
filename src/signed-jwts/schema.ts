import { Schema } from 'redis-om'
import { StorageJwt } from '@/shared/jwt-storage/types'

export const signedJwtSchema = new Schema<StorageJwt>(
  'signed-jwt',
  {
    jti: { type: 'string' },
    sub: { type: 'number' },
  },
  { dataStructure: 'HASH' },
)
