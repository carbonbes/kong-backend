import { Test, TestingModule } from '@nestjs/testing'
import { CommentsController } from './comments.controller'
import { CommentsService } from '@/comments/comments.service'
import { mock, MockProxy } from 'vitest-mock-extended'
import { getFakeComment } from '@/test/utils'
import { CreateCommentDto } from '@/comments/dtos'
import { CreateCommentOptions } from '@/comments/types'

describe('CommentsController', () => {
  let commentsController: CommentsController
  let commentsService: MockProxy<CommentsService>

  beforeEach(async () => {
    commentsService = mock<CommentsService>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: CommentsService, useValue: commentsService }],
      controllers: [CommentsController],
    }).compile()

    commentsController = module.get<CommentsController>(CommentsController)
  })

  describe('create', () => {
    test('should create a root comment', async () => {
      const comment = getFakeComment({ parentCommentId: null })
      const body: CreateCommentDto = { content: comment.content }
      const options: CreateCommentOptions = {
        authorId: comment.authorId,
        articleId: comment.articleId,
        ...body,
      }

      commentsService.create.mockResolvedValue(comment)

      const result = await commentsController.create(
        options.authorId,
        options.articleId,
        body,
      )

      expect(commentsService.create).toHaveBeenCalledWith(options)
      expect(result).toEqual(comment)
    })

    test('should create a child comment', async () => {
      const comment = getFakeComment()
      const body: CreateCommentDto = {
        parentCommentId: comment.parentCommentId,
        content: comment.content,
      }
      const options: CreateCommentOptions = {
        authorId: comment.authorId,
        articleId: comment.articleId,
        ...body,
      }

      commentsService.create.mockResolvedValue(comment)

      const result = await commentsController.create(
        options.authorId,
        options.articleId,
        body,
      )

      expect(commentsService.create).toHaveBeenCalledWith(options)
      expect(result).toEqual(comment)
    })
  })

  describe('findManyByArticle', () => {

  })
})
