import { HeadingNodeDto, TextNodeDto } from '@/shared/tiptap/dtos'
import { getFakeTextNode } from './getFakeTextNode'

type Attrs = { level: HeadingNodeDto['attrs']['level'] }

type GetFakeHeadingNodeOptions = {
  attrs?: Attrs
  content?: TextNodeDto[]
}

export const getFakeHeadingNode = ({
  attrs,
  content,
}: GetFakeHeadingNodeOptions = {}): HeadingNodeDto => ({
  type: 'heading',
  attrs: attrs ?? { level: 1 },
  content: content ?? [getFakeTextNode()],
})
