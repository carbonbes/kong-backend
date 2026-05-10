import { PrismaClient } from '@/prisma/types'
import { getFakeParagraphNode } from '@/test/utils'
import { JSONContent } from '@tiptap/core'

export const createComments = (
  prismaClient: PrismaClient,
  count: number,
  parentCommentId?: number,
) =>
  prismaClient.comment.createMany({
    data: Array.from({ length: count }).map((_, i) => ({
      authorId: 1,
      articleId: 1,
      content: {
        type: 'doc',
        content: [getFakeParagraphNode() as JSONContent],
      },
      parentCommentId: parentCommentId ?? null,
      createdAt: i,
      rating: i,
    })),
  })
