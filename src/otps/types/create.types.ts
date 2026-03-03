import { Otp } from './otp.type'

export type CreateOptions = Pick<Otp, 'type' | 'userId'>
export type CreateReturn = Promise<Otp>
