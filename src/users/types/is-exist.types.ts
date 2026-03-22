import { User } from '@/users/entities'

export type IsExistOptions = Partial<User>
export type IsExistReturn = Promise<boolean>
