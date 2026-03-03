import { Entity } from 'redis-om'
import { Otp } from './otp.type'

export interface OtpSchema extends Entity, Otp {}
