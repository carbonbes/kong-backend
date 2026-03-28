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
import { CreateArticleDto, UpdateArticleDto } from './dtos'
import { Session } from '@/shared/decorators'
import { CommentsService } from '@/comments/comments.service'
import { CreateCommentDto, UpdateCommentDto } from '@/comments/dtos'
import { FindManyCommentsQueryDto } from '@/comments/dtos'

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
  findOneArticle(@Param('articleId', ParseIntPipe) articleId: number) {
    return this.articlesService.findOne({ id: articleId })
  }

  @Patch('/:articleId')
  updateArticle(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Body() body: UpdateArticleDto,
  ) {
    return this.articlesService.update({ where: { id: articleId }, data: body })
  }

  @Delete('/:articleId')
  deleteArticle(@Param('articleId', ParseIntPipe) articleId: number) {
    return this.articlesService.delete({ id: articleId })
  }

  @Post('/:articleId/comments')
  createComment(
    @Session('id') authorId: number,
    @Param('articleId', ParseIntPipe) articleId: number,
    @Body() body: CreateCommentDto,
  ) {
    return this.commentsService.create({
      authorId,
      articleId,
      ...body,
    })
  }

  @Get('/:articleId/comments')
  findManyComments(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Query() query: FindManyCommentsQueryDto,
  ) {
    return this.commentsService.findManyByArticle({ articleId, ...query })
  }

  @Patch('/comments/:commentId')
  updateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: UpdateCommentDto,
  ) {
    return this.commentsService.update({
      where: { id: commentId },
      data: body,
    })
  }

  @Delete('/comments/:commentId')
  deleteComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.commentsService.delete({ id: commentId })
  }
}
