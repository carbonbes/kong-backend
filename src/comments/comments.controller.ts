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
  FindManyCommentsByAuthorQueryDto,
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
    return this.commentsService.create({
      data: { authorId, articleId, ...body },
    })
  }

  @Get('/articles/:articleId')
  async findManyByArticle(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Query() query: FindManyCommentsByArticleQueryDto,
  ) {
    const {
      cursor,
      limit = 10,
      orderBy = 'desc',
      parentCommentId,
      sortBy = 'rating',
    } = query

    const items = await this.commentsService.findMany({
      where: { articleId, parentCommentId },
      orderBy: { [sortBy]: orderBy },
      cursor: cursor ? JSON.parse(atob(cursor)) : null,
      take: limit,
    })

    return {
      items,
      meta: {
        cursor: btoa(
          JSON.stringify({ id: items[items.length - 1].id, [sortBy]: orderBy }),
        ),
      },
    }
  }

  @Get('/users/:userId')
  async findManyByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: FindManyCommentsByAuthorQueryDto,
  ) {
    const { cursor, limit = 10, orderBy = 'desc', sortBy = 'rating' } = query

    const items = await this.commentsService.findMany({
      where: { authorId: userId },
      orderBy: { [sortBy]: orderBy },
      cursor: cursor ? JSON.parse(atob(cursor)) : null,
      take: limit,
    })

    return {
      items,
      meta: {
        cursor: btoa(
          JSON.stringify({ id: items[items.length - 1].id, [sortBy]: orderBy }),
        ),
      },
    }
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
    return this.commentsService.delete({ where: { id: commentId } })
  }
}
