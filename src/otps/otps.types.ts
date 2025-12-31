import { Entity } from 'redis-om'
import { OtpType } from '@/otps/otps.enums'
import { User } from '@/users/users.types'
import { Uuid } from '@/shared/types'

export type Otp = {
  id: Uuid
  code: string
  type: OtpType
  userId: User['id']
}

export interface OtpSchema extends Entity, Otp {}

export type CreateOptions = Pick<Otp, 'type' | 'userId'>
export type VerifyOptions = Otp
