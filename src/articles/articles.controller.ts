import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ArticlesService } from './articles.service'
import { CreateArticleDto, UpdateArticleDto } from './dtos'
import { Session } from '@/shared/decorators'
import { CommentsService } from '@/comments/comments.service'
import { CreateCommentDto } from '@/comments/dtos'
import { FindManyCommentsByArticleQueryDto } from '@/articles/dtos/find-many-comments-by-article-query.dto'

@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly commentsService: CommentsService,
  ) {}

  @Post()
  createArticle(
    @Session('id') authorId: number,
    @Body() { content }: CreateArticleDto,
  ) {
    return this.articlesService.create({ authorId, content })
  }

  @Get('/:articleId')
  findOneArticle(@Param('articleId') articleId: number) {
    return this.articlesService.findOne({ id: articleId })
  }

  @Patch('/:articleId')
  updateArticle(
    @Param('articleId') articleId: number,
    @Body() body: UpdateArticleDto,
  ) {
    return this.articlesService.update({ where: { id: articleId }, data: body })
  }

  @Delete('/:articleId')
  deleteArticle(@Param('articleId') articleId: number) {
    return this.articlesService.delete({ id: articleId })
  }

  @Post('/:articleId/comments')
  createComment(
    @Session('id') authorId: number,
    @Param('articleId') articleId: number,
    @Body() { parentCommentId, content }: CreateCommentDto,
  ) {
    return this.commentsService.create({
      authorId,
      articleId,
      parentCommentId,
      content,
    })
  }

  @Get('/:articleId/comments')
  findManyComments(
    @Param('articleId') articleId: number,
    @Query() { sortBy, cursor }: FindManyCommentsByArticleQueryDto,
  ) {
    return this.commentsService.findManyByArticle({
      articleId,
      limit: 50,
      sortBy,
      cursor,
    })
  }
}
