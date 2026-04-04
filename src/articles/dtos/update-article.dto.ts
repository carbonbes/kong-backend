import { ArticleDto } from './article.dto'
import { PartialType, PickType } from '@nestjs/mapped-types'

export class UpdateArticleDto extends PartialType(
  PickType(ArticleDto, ['subsiteId', 'content', 'status'] as const),
) {}
