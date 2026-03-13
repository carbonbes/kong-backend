import { Article as ArticleType, ArticleStatus } from '@/articles/types'
import { JsonValue } from '@/prisma/types'

export class Article implements ArticleType {
  id: number
  authorId: number
  content: JsonValue
  status: ArticleStatus
  createdAt: Date
  updatedAt: Date
}
