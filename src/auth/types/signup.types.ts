import { SignUpDto } from '@/auth/dtos'
import { LoginReturn } from './login-return.type'

export type SignUpOptions = SignUpDto
export type SignUpReturn = Promise<LoginReturn>
