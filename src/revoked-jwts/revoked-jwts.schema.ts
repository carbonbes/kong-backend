import { Schema } from 'redis-om'
import { RevokedJwt } from '@/revoked-jwts/revoked-jwts.types'

export const revokedJwtSchema = new Schema<RevokedJwt>(
  'revoked-jwt',
  {
    jti: { type: 'string' },
    sub: { type: 'number' },
    exp: { type: 'number' },
  },
  { dataStructure: 'HASH' },
)
