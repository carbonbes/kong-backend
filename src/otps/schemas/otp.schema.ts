import { Schema } from 'redis-om'
import { OtpSchema } from '@/otps/types'

export const otpSchema = new Schema<OtpSchema>(
  'otp',
  {
    code: { type: 'string' },
    type: { type: 'string' },
    userId: { type: 'number' },
    userEmail: { type: 'string' },
  },
  { dataStructure: 'HASH' },
)
