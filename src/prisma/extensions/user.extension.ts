import { Prisma } from '../../../generated/prisma/client'

export const userExtension = Prisma.defineExtension({
  result: {
    user: {
      createdAt: {
        needs: { createdAt: true },
        compute: (user) => user.createdAt.toISOString(),
      },
    },
  },
})
