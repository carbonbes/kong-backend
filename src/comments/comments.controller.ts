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
  FindManyCommentsQueryDto,
  UpdateCommentDto,
} from '@/comments/dtos'
import { Session } from '@/shared/decorators'

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Session('id') authorId: number, @Body() body: CreateCommentDto) {
    return this.commentsService.create({
      data: { authorId, ...body },
    })
  }

  @Get()
  async findMany(@Query() query: FindManyCommentsQueryDto) {
    const { articleId, authorId, parentCommentId, sortBy, ...etc } = query

    return this.commentsService.findMany({
      paginationKeys: ['id', sortBy],
      where: { articleId, authorId, parentCommentId },
      ...etc,
    })
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
