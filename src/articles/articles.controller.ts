import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common'
import { ArticlesService } from './articles.service'
import { CreateArticleDto, UpdateArticleDto } from './dtos'
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
