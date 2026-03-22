import { User } from '@/users/entities'

export type CreateOptions = Pick<User, 'email' | 'name' | 'gender'>
export type CreateReturn = Promise<User>
