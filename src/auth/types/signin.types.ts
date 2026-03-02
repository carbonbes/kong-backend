import { SignInDto } from '@/auth/dtos'
import { LoginReturn } from '@/auth/types/login-return.type'

export type SignInOptions = SignInDto
export type SignInReturn = Promise<LoginReturn>
