import { Otp } from './otp.type'

export type VerifyOptions = Pick<Otp, 'code' | 'type' | 'email'>
export type VerifyReturn = Promise<boolean>
