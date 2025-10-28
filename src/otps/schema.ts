import { Schema } from 'redis-om'
import { OtpSchema } from '@/otps/types'

export const otpSchema = new Schema<OtpSchema>(
  'otp',
  {
    id: { type: 'string' },
    code: { type: 'string' },
    type: { type: 'string' },
    userId: { type: 'number' },
  },
  { dataStructure: 'HASH' },
)
