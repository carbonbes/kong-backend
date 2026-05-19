import { PrismaClient } from '@/prisma/types'
import { getFakeParagraphNode } from '@/test/utils'
import { JSONContent } from '@tiptap/core'

export const createArticles = (prismaClient: PrismaClient, count: number) => {
  const result = prismaClient.article.createMany({
    data: Array.from({ length: count }).map((_, i) => ({
      authorId: 1,
      subsiteId: 1,
      content: {
        type: 'doc',
        content: [getFakeParagraphNode() as JSONContent],
      },
      createdAt: new Date(i),
      rating: i,
    })),
  })

  return JSON.parse(JSON.stringify(result))
}
