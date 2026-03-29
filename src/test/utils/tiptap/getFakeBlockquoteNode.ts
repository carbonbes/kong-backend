import { BlockquoteNodeDto, ParagraphNodeDto } from '@/shared/tiptap/dtos'
import { getFakeParagraphNode } from './getFakeParagraphNode'

type GetFakeBlockquoteNodeOptions = {
  content?: ParagraphNodeDto[]
}

export const getFakeBlockquoteNode = ({
  content,
}: GetFakeBlockquoteNodeOptions = {}): BlockquoteNodeDto => ({
  type: 'blockquote',
  content: content ?? [getFakeParagraphNode()],
})
