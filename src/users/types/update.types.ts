import { User } from '@/users/entities'

export type UpdateOptions = {
  where: Partial<Pick<User, 'id' | 'email'>>
  data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
}
export type UpdateReturn = Promise<User>
