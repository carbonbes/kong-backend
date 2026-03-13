import { Article, ArticleStatus } from '@/articles/types'
import { faker } from '@faker-js/faker/locale/ru'
import { getFakeInt } from '@/test/utils/getFakeInt'

type GetFakeArticleOptions = Partial<Article>

const statuses: ArticleStatus[] = ['DRAFT', 'SCHEDULED', 'PUBLISHED']

export const getFakeArticle = ({
  id,
  authorId,
  content,
  status,
  createdAt,
  updatedAt,
}: GetFakeArticleOptions = {}): Article => ({
  id: id ?? getFakeInt(),
  authorId: authorId ?? getFakeInt(),
  content: content ?? {
    title: faker.lorem.sentence(),
    body: faker.lorem.paragraph(),
  },
  status: status ?? faker.helpers.arrayElement(statuses),
  createdAt: createdAt ?? faker.date.past(),
  updatedAt: updatedAt ?? faker.date.recent(),
})
