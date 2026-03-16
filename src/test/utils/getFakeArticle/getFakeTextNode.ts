import { faker } from '@faker-js/faker/locale/ru'
import type {
  BlurMarkDto,
  BoldMarkDto,
  ItalicMarkDto,
  LinkMarkDto,
  StrikeMarkDto,
  TextNodeDto,
} from '@/articles/dtos'

type TextMark =
  | BlurMarkDto
  | BoldMarkDto
  | ItalicMarkDto
  | LinkMarkDto
  | StrikeMarkDto

type GetFakeTextNodeOptions = {
  text?: string
  marks?: TextMark[]
}

export const getFakeTextNode = (
  options: GetFakeTextNodeOptions = {},
): TextNodeDto => {
  const { text, marks } = options

  const node: TextNodeDto = {
    type: 'text',
    text: text ?? faker.lorem.paragraph(),
  }

  if (marks !== undefined) {
    node.marks = marks
  }

  return node
}
