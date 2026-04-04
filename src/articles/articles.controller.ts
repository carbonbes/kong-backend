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
import { ArticlesService } from '@/articles/articles.service'
import {
  CreateArticleDto,
  FindManyArticlesByAuthorQueryDto,
  FindManyArticlesBySubsiteQueryDto,
  UpdateArticleDto,
} from '@/articles/dtos'
import { Session } from '@/shared/decorators'

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  create(
    @Session('id') authorId: number,
    @Body() { content }: CreateArticleDto,
  ) {
    return this.articlesService.create({ authorId, content })
  }

  @Get('/:articleId')
  findOne(@Param('articleId', ParseIntPipe) articleId: number) {
    return this.articlesService.findOne({ id: articleId })
  }

  @Get('/users/:userId')
  findManyByAuthor(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: FindManyArticlesByAuthorQueryDto,
  ) {
    return this.articlesService.findManyByAuthor({ authorId: userId, ...query })
  }

  @Get('/subsites/:subsiteId')
  findManyBySubsite(
    @Param('subsiteId', ParseIntPipe) subsiteId: number,
    @Query() query: FindManyArticlesBySubsiteQueryDto,
  ) {
    return this.articlesService.findManyBySubsite({ subsiteId, ...query })
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
    return this.articlesService.delete({ id: articleId })
  }
}
