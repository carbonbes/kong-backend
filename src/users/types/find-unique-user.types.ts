import { User } from '@/users/types'

export type FindUniqueUserOptions = Pick<User, 'id'>
export type FindUniqueUserReturn = Promise<User | null>
