import { ParagraphNodeDto, ListItemNodeDto } from '@/shared/tiptap/dtos'
import { getFakeParagraphNode } from './getFakeParagraphNode'

type GetFakeListItemNodeOptions = {
  content?: ParagraphNodeDto[]
}

export const getFakeListItemNode = ({
  content,
}: GetFakeListItemNodeOptions = {}): ListItemNodeDto => ({
  type: 'listItem',
  content: content ?? [getFakeParagraphNode()],
})
