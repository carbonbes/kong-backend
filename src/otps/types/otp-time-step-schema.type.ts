import { Entity } from 'redis-om'
import { OtpTimeStep } from '@/otps/types/otp-time-step.type'

export interface OtpTimeStepSchema extends Entity, OtpTimeStep {
  timeStep: number
}
