import { PrismaClient } from '@/prisma/types'
import { getFakeParagraphNode } from '@/test/utils'
import { JSONContent } from '@tiptap/core'

export const createComments = async (
  prismaClient: PrismaClient,
  count: number,
  parentCommentId?: number,
) => {
  const result = await prismaClient.comment.createMany({
    data: Array.from({ length: count }).map((_, i) => ({
      authorId: 1,
      articleId: 1,
      content: {
        type: 'doc',
        content: [getFakeParagraphNode() as JSONContent],
      },
      parentCommentId: parentCommentId ?? null,
      createdAt: new Date(i),
      rating: i,
    })),
  })

  return JSON.parse(JSON.stringify(result))
}
