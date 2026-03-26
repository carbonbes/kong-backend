import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { CommentsService } from '@/comments/comments.service'
import { Session } from '@/shared/decorators'
import { CreateCommentDto, UpdateCommentDto } from '@/comments/dtos'

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Session('id') authorId: number, @Body() body: CreateCommentDto) {
    return this.commentsService.create({ authorId, ...body })
  }

  @Get('/:commentId')
  findOne(@Param('commentId') id: number) {
    return this.commentsService.findOne({ id })
  }

  @Get('/articles/:articleId')
  findManyByArticle(@Param('articleId') articleId: number) {
    return this.commentsService.findManyByArticle({ articleId, limit: 50 })
  }

  @Get('/users/:userId')
  findManyByAuthor(@Param('userId') userId: number) {
    return this.commentsService.findManyByAuthor({
      authorId: userId,
      limit: 10,
    })
  }

  @Patch('/:commentId')
  update(
    @Param('commentId') id: number,
    @Body() { content }: UpdateCommentDto,
  ) {
    return this.commentsService.update({ where: { id }, data: { content } })
  }

  @Delete('/:commentId')
  delete(@Param('commentId') id: number) {
    return this.commentsService.delete({ id })
  }
}
