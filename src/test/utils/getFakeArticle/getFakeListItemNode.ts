import type { ListItemNodeDto } from '@/articles/dtos'
import { getFakeParagraphNode } from '@/test/utils/getFakeArticle/getFakeParagraphNode'

type GetFakeListItemNodeOptions = Partial<ListItemNodeDto>

export const getFakeListItemNode = (
  options: GetFakeListItemNodeOptions = {},
): ListItemNodeDto => {
  const { content } = options

  return {
    type: 'listItem',
    content: content ?? [getFakeParagraphNode()],
  }
}
