import type { BlockquoteNodeDto } from '@/articles/dtos'
import { getFakeParagraphNode } from '@/test/utils/getFakeArticle/getFakeParagraphNode'

type GetFakeBlockquoteNodeOptions = Partial<BlockquoteNodeDto>

export const getFakeBlockquoteNode = (
  options: GetFakeBlockquoteNodeOptions = {},
): BlockquoteNodeDto => {
  const { content } = options

  return {
    type: 'blockquote',
    content: content ?? [getFakeParagraphNode()],
  }
}
