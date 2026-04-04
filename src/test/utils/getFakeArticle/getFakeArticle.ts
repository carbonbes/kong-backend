import { Article } from '@/articles/entities'
import { ArticleStatus } from '@/articles/enums'
import { faker } from '@faker-js/faker/locale/ru'
import {
  getFakeArticleContent,
  getFakeSubsite,
  getFakeUser,
} from '@/test/utils'

type GetFakeArticleOptions = Partial<Article>

export const getFakeArticle = ({
  id,
  authorId,
  author,
  subsiteId,
  subsite,
  content,
  status,
  rating,
  createdAt,
  updatedAt,
}: GetFakeArticleOptions = {}): Article => ({
  id: id ?? faker.number.int(),
  authorId: authorId ?? faker.number.int(),
  author: author ?? getFakeUser(),
  subsiteId: subsiteId ?? faker.number.int(),
  subsite: subsite ?? getFakeSubsite(),
  content: content ?? getFakeArticleContent(),
  status: status ?? faker.helpers.enumValue(ArticleStatus),
  rating: rating ?? faker.number.int(),
  createdAt: createdAt ?? faker.date.recent().getTime() / 1000,
  updatedAt: updatedAt ?? faker.date.soon().getTime() / 1000,
  beforeUpdateHandle() {},
})
