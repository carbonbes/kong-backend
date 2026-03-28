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
import { CommentsService } from '@/comments/comments.service'
import {
  CreateCommentDto,
  FindManyCommentsByArticleQueryDto,
  FindManyCommentsQueryDto,
  UpdateCommentDto,
} from '@/comments/dtos'
import { Session } from '@/shared/decorators'

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('/articles/:articleId')
  create(
    @Session('id') authorId: number,
    @Param('articleId', ParseIntPipe) articleId: number,
    @Body() body: CreateCommentDto,
  ) {
    return this.commentsService.create({ authorId, articleId, ...body })
  }

  @Get('/articles/:articleId')
  findManyByArticle(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Query() query: FindManyCommentsByArticleQueryDto,
  ) {
    return this.commentsService.findManyByArticle({ articleId, ...query })
  }

  @Get('/users/:userId')
  findManyByAuthor(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: FindManyCommentsQueryDto,
  ) {
    return this.commentsService.findManyByAuthor({ authorId: userId, ...query })
  }

  @Patch('/:commentId')
  update(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: UpdateCommentDto,
  ) {
    return this.commentsService.update({ where: { id: commentId }, data: body })
  }

  @Delete('/:commentId')
  delete(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.commentsService.delete({ id: commentId })
  }
}
