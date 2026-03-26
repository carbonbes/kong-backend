import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { ArticlesService } from './articles.service'
import { CreateArticleDto, UpdateArticleDto } from './dtos'
import { Session } from '@/shared/decorators'
import { CreateArticleOptions, UpdateArticleOptions } from '@/articles/types'

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  create(
    @Session('id') authorId: number,
    @Body() { content }: CreateArticleDto,
  ) {
    const options: CreateArticleOptions = { authorId, content }

    return this.articlesService.create(options)
  }

  @Get('/:articleId')
  findOne(@Param('articleId') id: number) {
    return this.articlesService.findOne({ id })
  }

  @Patch('/:articleId')
  update(@Param('articleId') id: number, @Body() body: UpdateArticleDto) {
    const options: UpdateArticleOptions = { where: { id }, data: body }

    return this.articlesService.update(options)
  }

  @Delete('/:articleId')
  delete(@Param('articleId') id: number) {
    return this.articlesService.delete({ id })
  }
}
