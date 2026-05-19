import { PrismaClient } from '@/prisma/types'
import { getFakeParagraphNode } from '@/test/utils'
import { JSONContent } from '@tiptap/core'

export const createArticle = async (prismaClient: PrismaClient) => {
  const result = await prismaClient.article.create({
    data: {
      authorId: 1,
      content: {
        type: 'doc',
        content: [getFakeParagraphNode() as JSONContent],
      },
    },
  })

  return JSON.parse(JSON.stringify(result))
}
