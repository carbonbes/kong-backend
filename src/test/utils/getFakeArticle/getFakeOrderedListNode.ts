import type { OrderedListNodeDto } from '@/articles/dtos'
import { getFakeListItemNode } from '@/test/utils/getFakeArticle/getFakeListItemNode'

type GetFakeOrderedListNodeOptions = Partial<OrderedListNodeDto>

export const getFakeOrderedListNode = (
  options: GetFakeOrderedListNodeOptions = {},
): OrderedListNodeDto => {
  const { attrs, content } = options

  const node: OrderedListNodeDto = {
    type: 'orderedList',
    content: content ?? [getFakeListItemNode()],
  }

  if (attrs !== undefined) {
    node.attrs = attrs
  }

  return node
}
