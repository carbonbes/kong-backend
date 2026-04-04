import { User } from '@/users/types'

export type CreateUserOptions = Pick<User, 'email' | 'name' | 'gender'>
export type CreateUserReturn = Promise<User>
