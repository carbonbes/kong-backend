import { Article } from '@/articles/entities'
import {
  FindManyArticlesOptions,
  FindManyArticlesReturn,
} from '@/articles/types/shared'

export type FindManyArticlesByAuthorOptions = FindManyArticlesOptions &
  Pick<Article, 'authorId'> & {
    select?: { author: boolean; subsite: boolean }
  }

export type FindManyArticlesByAuthorReturn = FindManyArticlesReturn
