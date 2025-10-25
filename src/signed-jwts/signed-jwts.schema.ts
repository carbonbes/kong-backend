import { Schema } from 'redis-om'
import { SignedJwt } from '@/signed-jwts/signed-jwts.types'

export const signedJwtSchema = new Schema<SignedJwt>(
  'signed-jwt',
  {
    jti: { type: 'string' },
    sub: { type: 'number' },
    exp: { type: 'number' },
  },
  { dataStructure: 'HASH' },
)
