import { User } from './user.type'

export type FindOneOptions = Partial<User>
export type FindOneReturn = Promise<User | null>
