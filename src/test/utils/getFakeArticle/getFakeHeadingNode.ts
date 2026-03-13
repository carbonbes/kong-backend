import { faker } from '@faker-js/faker/locale/ru'
import type { HeadingNodeDto } from '@/articles/dtos'
import { getFakeTextNode } from '@/test/utils/getFakeArticle/getFakeTextNode'

type GetFakeHeadingNodeOptions = Partial<HeadingNodeDto>

export const getFakeHeadingNode = (
  options: GetFakeHeadingNodeOptions = {},
): HeadingNodeDto => {
  const { attrs, content } = options

  return {
    type: 'heading',
    attrs: attrs ?? { level: faker.number.int({ min: 1, max: 6 }) },
    content: content ?? [getFakeTextNode()],
  }
}
