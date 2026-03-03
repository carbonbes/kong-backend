import { Prisma } from '@/prisma/prisma.types'
import { User } from './user.type'

export type SetActiveOptions = Pick<Prisma.UserFindUniqueArgs, 'where'> & {
  value: boolean
}
export type SetActiveReturn = Promise<User>
