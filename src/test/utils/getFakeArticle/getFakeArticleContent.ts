import type { ArticleContentDto } from '@/articles/dtos'
import { JSONContent } from '@tiptap/core'

type GetFakeArticleContentOptions = Partial<ArticleContentDto>

export const getFakeArticleContent = (
  options: GetFakeArticleContentOptions = {},
): JSONContent => {
  const { content } = options

  return {
    type: 'doc',
    content: content ?? [
      { type: 'heading', content: [{ type: 'text', text: 'Test' }] },
    ],
  }
}
