import { TextNodeDto } from '@/shared/tiptap/dtos/nodes/text-node.dto'
import { faker } from '@faker-js/faker/locale/ru'

type GetFakeTextNodeOptions = { text?: string }

export const getFakeTextNode = ({
  text,
}: GetFakeTextNodeOptions = {}): TextNodeDto => ({
  type: 'text',
  text: text ?? faker.lorem.text(),
})
