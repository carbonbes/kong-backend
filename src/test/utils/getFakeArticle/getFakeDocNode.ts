import type { DocNodeDto } from '@/articles/dtos'
import { JSONContent } from '@tiptap/core'

type GetFakeDocNodeOptions = Partial<DocNodeDto>

export const getFakeDocNode = (
  options: GetFakeDocNodeOptions = {},
): JSONContent => {
  const { content } = options

  return {
    type: 'doc',
    content: content ?? [
      { type: 'heading', content: [{ type: 'text', text: 'Test' }] },
    ],
  }
}
