import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ArticlesService } from './articles.service'
import {
  CreateArticleDto,
  FindManyArticlesQueryDto,
  UpdateArticleDto,
} from './dtos'
import { Session } from '@/shared/decorators'

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  create(
    @Session('id') authorId: number,
    @Body() { content }: CreateArticleDto,
  ) {
    return this.articlesService.create({ data: { authorId, content } })
  }

  @Get('/:articleId')
  findUnique(@Param('articleId', ParseIntPipe) articleId: number) {
    return this.articlesService.findUnique({ where: { id: articleId } })
  }

  @Get()
  findMany(@Query() query: FindManyArticlesQueryDto) {
    const { after, before, limit, orderBy, sortBy = 'rating', ...where } = query

    return this.articlesService.findMany({
      after,
      before,
      limit,
      orderBy,
      paginationKeys: ['id', sortBy],
      where,
    })
  }

  @Patch('/:articleId')
  update(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Body() body: UpdateArticleDto,
  ) {
    return this.articlesService.update({ where: { id: articleId }, data: body })
  }

  @Delete('/:articleId')
  delete(@Param('articleId', ParseIntPipe) articleId: number) {
    return this.articlesService.delete({ where: { id: articleId } })
  }
}
