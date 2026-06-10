import { PrismaClient } from '@/prisma/types'
import { User, UserCreateInput } from '@/users/types'

export const createUser = async (
  prismaClient: PrismaClient,
  data: UserCreateInput,
): Promise<User> => {
  const result = await prismaClient.user.create({ data })

  return JSON.parse(JSON.stringify(result))
}
