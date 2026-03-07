import { Schema } from 'redis-om'
import { Otp } from '@/otps/types'

export const otpSchema = new Schema<Otp>(
  'otp',
  {
    id: { type: 'string' },
    code: { type: 'string' },
    type: { type: 'string' },
    email: { type: 'string' },
  },
  { dataStructure: 'HASH' },
)
