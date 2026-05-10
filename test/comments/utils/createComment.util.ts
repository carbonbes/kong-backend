import { PrismaClient } from '@/prisma/types'
import { getFakeParagraphNode } from '@/test/utils'
import { JSONContent } from '@tiptap/core'

export const createComment = (
  prismaClient: PrismaClient,
  parentCommentId?: number,
) =>
  prismaClient.comment.create({
    data: {
      authorId: 1,
      articleId: 1,
      parentCommentId: parentCommentId ?? null,
      content: {
        type: 'doc',
        content: [getFakeParagraphNode() as JSONContent],
      },
    },
  })
