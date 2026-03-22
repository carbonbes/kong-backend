import { User } from '@/users/entities'

export type FindOneOptions = Partial<User>
export type FindOneReturn = Promise<User | null>
