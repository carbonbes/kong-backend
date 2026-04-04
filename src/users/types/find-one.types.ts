import { User } from '@/users/entities'

export type FindOneOptions = Partial<Pick<User, 'id' | 'email'>>
export type FindOneReturn = Promise<User | null>
