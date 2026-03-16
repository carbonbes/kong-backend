import { Prisma } from '../../../generated/prisma/client'

export const articleExtension = Prisma.defineExtension({
  result: {
    article: {
      createdAt: {
        needs: { createdAt: true },
        compute: (article) => article.createdAt.toISOString(),
      },
      updatedAt: {
        needs: { updatedAt: true },
        compute: (article) => article.updatedAt.toISOString(),
      },
    },
  },
})
