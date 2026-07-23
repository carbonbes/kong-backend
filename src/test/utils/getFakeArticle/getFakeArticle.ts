import { Article } from '@/articles/types'
import { ArticleStatus } from '@/articles/enums'
import { faker } from '@faker-js/faker/locale/ru'
import { getFakeInt } from '@/test/utils/getFakeInt'
import { getFakeArticleContent } from '@/test/utils'
import { JSONContent } from '@tiptap/core'

type FakeArticle = Omit<Article, 'content'> & { content: JSONContent }
type GetFakeArticleOptions = Partial<FakeArticle>
type GetFakeArticleReturn = FakeArticle

export const getFakeArticle = ({
  id,
  authorId,
  subsiteId,
  rating,
  content,
  status,
  createdAt,
  updatedAt,
}: GetFakeArticleOptions = {}): GetFakeArticleReturn => ({
  id: id ?? getFakeInt(),
  authorId: authorId ?? faker.number.int(),
  subsiteId: subsiteId ?? faker.number.int(),
  rating: rating ?? faker.number.int(),
  content: content ?? getFakeArticleContent(),
  status: status ?? faker.helpers.enumValue(ArticleStatus),
  createdAt: createdAt ?? faker.date.past(),
  updatedAt: updatedAt ?? faker.date.recent(),
})
