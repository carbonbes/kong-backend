import { VerifyOtpDto } from '@/auth/dtos'
import { AuthJwts } from '@/auth-jwts/types/auth-jwts.type'
import { User } from '@/users/types'

export type VerifyOtpOptions = VerifyOtpDto
export type VerifyOtpReturn = Promise<AuthJwts & { user: User }>
