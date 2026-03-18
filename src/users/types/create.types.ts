import { User } from './user.type'

export type CreateOptions = Pick<User, 'email' | 'name' | 'gender'>
export type CreateReturn = Promise<User>
