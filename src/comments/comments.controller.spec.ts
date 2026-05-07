import { Test, TestingModule } from '@nestjs/testing'
import { CommentsController } from './comments.controller'
import { CommentsService } from '@/comments/comments.service'
import { mock, MockProxy } from 'vitest-mock-extended'
import { getFakeComment, getFakeHeadingNode } from '@/test/utils'
import {
  CreateCommentDto,
  FindManyCommentsByArticleQueryDto,
  FindManyCommentsByAuthorQueryDto,
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
      const body: CreateCommentDto = { content: comment.content }
      const authorId = comment.authorId
      const articleId = comment.articleId

      commentsService.create.mockResolvedValue(comment)

      const result = await commentsController.create(authorId, articleId, body)

      expect(commentsService.create).toHaveBeenCalledWith({
        data: {
          articleId,
          authorId,
          ...body,
        },
      })
      expect(result).toEqual(comment)
    })

    test('should create a child comment', async () => {
      const comment = getFakeComment()
      const body: CreateCommentDto = {
        parentCommentId: comment.parentCommentId,
        content: comment.content,
      }
      const authorId = comment.authorId
      const articleId = comment.articleId

      commentsService.create.mockResolvedValue(comment)

      const result = await commentsController.create(authorId, articleId, body)

      expect(commentsService.create).toHaveBeenCalledWith({
        data: {
          articleId,
          authorId,
          ...body,
        },
      })
      expect(result).toEqual(comment)
    })
  })

  describe('findManyByArticle', () => {
    test('should find roots comments', async () => {
      const comments = Array.from({ length: 50 }).map(() =>
        getFakeComment({ parentCommentId: null }),
      )
      const articleId = 1
      const query: FindManyCommentsByArticleQueryDto = { limit: 50 }

      commentsService.findMany.mockResolvedValue({
        items: comments,
        meta: { after: null },
      })

      const result = await commentsController.findManyByArticle(
        articleId,
        query,
      )

      expect(commentsService.findMany).toHaveBeenCalledWith({
        articleId,
        ...query,
      })
      expect(result).toEqual({
        items: comments,
        meta: { cursor: null },
      })
    })

    test('should find child comments', async () => {
      const comments = Array.from({ length: 50 }).map(() => getFakeComment())
      const articleId = 1
      const query: FindManyCommentsByArticleQueryDto = {
        limit: 50,
        parentCommentId: 1,
      }

      commentsService.findManyByArticle.mockResolvedValue({
        items: comments,
        meta: { cursor: null },
      })

      const result = await commentsController.findManyByArticle(
        articleId,
        query,
      )

      expect(commentsService.findManyByArticle).toHaveBeenCalledWith({
        articleId,
        ...query,
      })
      expect(result).toEqual({
        items: comments,
        meta: { cursor: null },
      })
    })
  })

  describe('findManyByAuthor', () => {
    test('should find a comments', async () => {
      const comments = Array.from({ length: 50 }).map(() => getFakeComment())
      const userId = 1
      const query: FindManyCommentsByAuthorQueryDto = { limit: 50 }

      commentsService.findManyByAuthor.mockResolvedValue({
        items: comments,
        meta: { cursor: null },
      })

      const result = await commentsController.findManyByAuthor(userId, query)

      expect(commentsService.findManyByAuthor).toHaveBeenCalledWith({
        authorId: userId,
        ...query,
      })
      expect(result).toEqual({
        items: comments,
        meta: { cursor: null },
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
      const commentId = 1

      commentsService.delete.mockResolvedValue(comment)

      const result = await commentsController.delete(commentId)

      expect(commentsService.delete).toHaveBeenCalledWith({ id: commentId })
      expect(result).toEqual(comment)
    })
  })
})
