import { User } from '@/users/types/user.type'

export type IsExistOptions = Partial<User>
export type IsExistReturn = Promise<boolean>
