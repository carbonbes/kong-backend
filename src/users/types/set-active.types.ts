import { User } from '@/users/entities'

export type SetActiveOptions = {
  where: Partial<Pick<User, 'id' | 'email'>>
  data: Pick<User, 'isActive'>
}
export type SetActiveReturn = Promise<User>
