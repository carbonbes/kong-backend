import { PickType } from '@nestjs/mapped-types'
import { ArticleDto } from '@/articles/dtos/article.dto'
import { ArticleUncheckedCreateInput } from '@/articles/types'

export class CreateArticleDto
  extends PickType(ArticleDto, ['authorId', 'content'] as const)
  implements ArticleUncheckedCreateInput {}
