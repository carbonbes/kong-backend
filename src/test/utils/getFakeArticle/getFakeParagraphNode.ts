import type { ParagraphNodeDto } from '@/articles/dtos'
import { getFakeTextNode } from '@/test/utils/getFakeArticle/getFakeTextNode'

type GetFakeParagraphNodeOptions = Partial<ParagraphNodeDto>

export const getFakeParagraphNode = (
  options: GetFakeParagraphNodeOptions = {},
): ParagraphNodeDto => {
  const { content } = options

  return {
    type: 'paragraph',
    content: content ?? [getFakeTextNode()],
  }
}
