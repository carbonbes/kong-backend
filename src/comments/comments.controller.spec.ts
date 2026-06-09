import { Test, TestingModule } from '@nestjs/testing'
import { CommentsController } from './comments.controller'
import { CommentsService } from '@/comments/comments.service'
import { mock, MockProxy } from 'vitest-mock-extended'
import { getFakeComment, getFakeHeadingNode } from '@/test/utils'
import {
  CreateCommentDto,
  FindManyCommentsQueryDto,
  UpdateCommentDto,
} from '@/comments/dtos'

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
      const body: CreateCommentDto = { articleId: 1, content: comment.content }
      const authorId = comment.authorId

      commentsService.create.mockResolvedValue(comment)

      const result = await commentsController.create(authorId, body)

      expect(commentsService.create).toHaveBeenCalledWith({
        data: {
          authorId,
          ...body,
        },
      })
      expect(result).toEqual(comment)
    })

    test('should create a child comment', async () => {
      const comment = getFakeComment()
      const body: CreateCommentDto = {
        articleId: 1,
        parentCommentId: comment.parentCommentId,
        content: comment.content,
      }
      const authorId = comment.authorId

      commentsService.create.mockResolvedValue(comment)

      const result = await commentsController.create(authorId, body)

      expect(commentsService.create).toHaveBeenCalledWith({
        data: {
          authorId,
          ...body,
        },
      })
      expect(result).toEqual(comment)
    })
  })

  describe('findMany', () => {
    describe('article', () => {
      test('should find roots comments', async () => {
        const comments = Array.from({ length: 10 }).map(() =>
          getFakeComment({ parentCommentId: null }),
        )
        const query: FindManyCommentsQueryDto = {
          articleId: 1,
          limit: 10,
          sortBy: 'rating',
        }

        const {
          after,
          before,
          limit,
          orderBy,
          sortBy = 'rating',
          ...where
        } = query

        commentsService.findMany.mockResolvedValue({
          items: comments,
          meta: { after: null, before: null },
        })

        const result = await commentsController.findMany(query)

        expect(commentsService.findMany).toHaveBeenCalledWith({
          after,
          before,
          limit,
          orderBy,
          paginationKeys: ['id', sortBy],
          where,
        })
        expect(result).toEqual({
          items: comments,
          meta: { after: null, before: null },
        })
      })

      test('should find child comments', async () => {
        const comments = Array.from({ length: 10 }).map(() => getFakeComment())
        const query: FindManyCommentsQueryDto = {
          limit: 10,
          parentCommentId: 1,
        }

        const {
          after,
          before,
          limit,
          orderBy,
          sortBy = 'rating',
          ...where
        } = query

        commentsService.findMany.mockResolvedValue({
          items: comments,
          meta: { after: null, before: null },
        })

        const result = await commentsController.findMany(query)

        expect(commentsService.findMany).toHaveBeenCalledWith({
          after,
          before,
          limit,
          orderBy,
          paginationKeys: ['id', sortBy],
          where,
        })
        expect(result).toEqual({
          items: comments,
          meta: { after: null, before: null },
        })
      })
    })

    describe('user', () => {
      test('should find a comments', async () => {
        const comments = Array.from({ length: 10 }).map(() => getFakeComment())
        const query: FindManyCommentsQueryDto = { authorId: 1, limit: 10 }

        commentsService.findMany.mockResolvedValue({
          items: comments,
          meta: { after: null, before: null },
        })

        const result = await commentsController.findMany(query)

        expect(commentsService.findMany).toHaveBeenCalledWith({
          limit: 10,
          paginationKeys: ['id', 'rating'],
          where: { authorId: 1 },
        })
        expect(result).toEqual({
          items: comments,
          meta: { after: null, before: null },
        })
      })
    })
  })

  describe('update', () => {
    test('should update a comment', async () => {
      const comment = getFakeComment({ id: 1 })
      const body: UpdateCommentDto = { content: [getFakeHeadingNode()] }
      const editedComment = { ...comment, ...body }

      commentsService.update.mockResolvedValue(editedComment)

      const result = await commentsController.update(1, body)

      expect(commentsService.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: body,
      })
      expect(result).toEqual(editedComment)
    })
  })

  describe('delete', () => {
    test('should delete a comment', async () => {
      const comment = getFakeComment({ id: 1 })

      commentsService.delete.mockResolvedValue(comment)

      const result = await commentsController.delete(1)

      expect(commentsService.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      })
      expect(result).toEqual(comment)
    })
  })
})
