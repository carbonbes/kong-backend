import { Schema } from 'redis-om'
import { StorageJwt } from '@/shared/jwt-storage/types'

export const revokedJwtSchema = new Schema<StorageJwt>(
  'revoked-jwt',
  {
    jti: { type: 'string' },
    sub: { type: 'number' },
  },
  { dataStructure: 'HASH' },
)
