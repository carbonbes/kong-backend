import { Article } from '@/articles/entities'
import {
  FindManyArticlesOptions,
  FindManyArticlesReturn,
} from '@/articles/types/shared'

export type FindManyArticlesBySubsiteOptions = FindManyArticlesOptions &
  Pick<Article, 'subsiteId'> & {
    select?: { author: boolean; subsite: boolean }
  }

export type FindManyArticlesBySubsiteReturn = FindManyArticlesReturn
