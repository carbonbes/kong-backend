import { Entity } from 'redis-om'
import { Otp } from '@/otps/types/otp.type'

export interface OtpSchema extends Entity, Otp {}
