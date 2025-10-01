import { User } from '../entity'

export type CreateUserInput = Pick<User, 'email' | 'name' | 'gender'>
export type UpdateUserInput = Partial<User>
export type FindOneByUserInput = Partial<User>
export type ActivateUserInput = Pick<User, 'email'>
