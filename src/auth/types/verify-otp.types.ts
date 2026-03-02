import { VerifyOtpDto } from '@/auth/dtos'
import { AuthJwts } from '@/auth/types/auth-jwts.type'

export type VerifyOtpOptions = VerifyOtpDto
export type VerifyOtpReturn = Promise<AuthJwts>
