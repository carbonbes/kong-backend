import { PrismaClient } from '@/prisma/types'
import { getFakeParagraphNode } from '@/test/utils'
import { JSONContent } from '@tiptap/core'

export const createComment = async (
  prismaClient: PrismaClient,
  parentCommentId?: number,
) => {
  const result = await prismaClient.comment.create({
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

  return JSON.parse(JSON.stringify(result))
}
