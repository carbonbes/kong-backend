import { Article } from '@/articles/entities'
import { ArticleStatus } from '@/articles/enums'
import { faker } from '@faker-js/faker/locale/ru'
import { getFakeInt } from '@/test/utils/getFakeInt'
import { getFakeArticleContent, getFakeUser } from '@/test/utils'

type GetFakeArticleOptions = Partial<Article>

export const getFakeArticle = ({
  id,
  author,
  content,
  status,
  createdAt,
  updatedAt,
}: GetFakeArticleOptions = {}): Article => ({
  id: id ?? getFakeInt(),
  author: author ?? getFakeUser(),
  content: content ?? getFakeArticleContent(),
  status: status ?? faker.helpers.enumValue(ArticleStatus),
  createdAt: createdAt ?? faker.date.past(),
  updatedAt: updatedAt ?? faker.date.recent(),
})
