import { Otp } from './otp.type'

export type CreateOptions = Pick<Otp, 'type' | 'email'>
export type CreateReturn = Promise<string>
