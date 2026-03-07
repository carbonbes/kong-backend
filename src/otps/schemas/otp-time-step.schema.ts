import { Schema } from 'redis-om'
import { OtpTimeStep } from '@/otps/types/otp-time-step.type'

export const otpTimeStepSchema = new Schema<OtpTimeStep>(
  'otp-time-step',
  {
    email: { type: 'string' },
    timeStep: { type: 'number' },
  },
  { dataStructure: 'HASH' },
)
