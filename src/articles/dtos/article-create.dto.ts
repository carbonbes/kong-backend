import { PickType } from '@nestjs/mapped-types'
import { ArticleDto } from '@/articles/dtos/article.dto'

export class CreateArticleDto extends PickType(ArticleDto, [
  'content',
] as const) {}
