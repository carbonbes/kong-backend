import { Entity } from 'redis-om'
import { Uuid } from '@/shared/types/uuid.type'
import { OtpType } from '@/otps/enums'

export type Otp = {
  id: Uuid
  code: string
  type: OtpType
  email: string
}

export interface OtpSchema extends Entity, Otp {}

export type CreateOptions = Pick<Otp, 'type' | 'email'>
export type VerifyOptions = Pick<Otp, 'id' | 'code' | 'type' | 'email'>
