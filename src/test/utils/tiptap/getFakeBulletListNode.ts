import { BulletListNodeDto, ListItemNodeDto } from '@/shared/tiptap/dtos'
import { getFakeListItemNode } from './getFakeListItemNode'

type GetFakeBulletNodeOptions = {
  content?: ListItemNodeDto[]
}

export const getFakeBulletListNode = ({
  content,
}: GetFakeBulletNodeOptions = {}): BulletListNodeDto => ({
  type: 'bulletList',
  content: content ?? [getFakeListItemNode()],
})
