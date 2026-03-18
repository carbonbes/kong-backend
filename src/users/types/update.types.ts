import { User } from './user.type'

export type UpdateOptions = {
  where: Partial<Pick<User, 'id' | 'email'>>
  data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
}
export type UpdateReturn = Promise<User>
