import { User } from '@/users/types'

export type UpdateUserOptions = {
  where: Pick<User, 'id'>
  data: Partial<Pick<User, 'email' | 'name' | 'gender' | 'isActive'>>
}
export type UpdateUserReturn = Promise<User>
