import { Otp } from '../entity'
import { User } from '../../users/entity'

export type CreateOtpInput = Pick<Otp, 'type' | 'user'>
export type CreateSignUpOtpInput = Pick<Otp, 'user'>
export type CreateSignInOtpInput = CreateSignUpOtpInput
export type VerifyOtpInput = Pick<Otp, 'otp' | 'type'> & Pick<User, 'email'>
