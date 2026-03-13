import type { BulletListNodeDto } from '@/articles/dtos'
import { getFakeListItemNode } from '@/test/utils/getFakeArticle/getFakeListItemNode'

type GetFakeBulletListNodeOptions = Partial<BulletListNodeDto>

export const getFakeBulletListNode = (
  options: GetFakeBulletListNodeOptions = {},
): BulletListNodeDto => {
  const { content } = options

  return {
    type: 'bulletList',
    content: content ?? [getFakeListItemNode()],
  }
}
