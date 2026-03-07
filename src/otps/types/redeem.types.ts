import { Otp } from './otp.type'

export type RedeemOptions = Pick<Otp, 'token' | 'email'>
export type RedeemReturn = Promise<boolean>
