import { OrderedListNodeDto, ListItemNodeDto } from '@/shared/tiptap/dtos'
import { getFakeListItemNode } from './getFakeListItemNode'

type GetFakeOrderedListNodeOptions = {
  content?: ListItemNodeDto[]
}

export const getFakeOrderedListNode = ({
  content,
}: GetFakeOrderedListNodeOptions = {}): OrderedListNodeDto => ({
  type: 'orderedList',
  content: content ?? [getFakeListItemNode()],
})
