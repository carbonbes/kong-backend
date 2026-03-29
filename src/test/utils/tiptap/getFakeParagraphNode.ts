import { ParagraphNodeDto, TextNodeDto } from '@/shared/tiptap/dtos'
import { getFakeTextNode } from './getFakeTextNode'

type GetFakeParagraphNodeOptions = {
  content?: TextNodeDto[]
}

export const getFakeParagraphNode = ({
  content,
}: GetFakeParagraphNodeOptions = {}): ParagraphNodeDto => ({
  type: 'paragraph',
  content: content ?? [getFakeTextNode()],
})
