import type { DocNodeDto } from '@/articles/dtos'
import { getFakeParagraphNode } from '@/test/utils/getFakeArticle/getFakeParagraphNode'

type GetFakeDocNodeOptions = Partial<DocNodeDto>

export const getFakeDocNode = (
  options: GetFakeDocNodeOptions = {},
): DocNodeDto => {
  const { content } = options

  return {
    type: 'doc',
    content: content ?? [getFakeParagraphNode()],
  }
}
