import { SignUpDto } from '@/auth/dtos'
import { LoginReturn } from '@/auth/types/login-return.type'

export type SignUpOptions = SignUpDto
export type SignUpReturn = Promise<LoginReturn>
