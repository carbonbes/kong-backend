import { Test, TestingModule } from '@nestjs/testing'
import { CommentsService } from './comments.service'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { Comment } from '@/comments/entities'
import { mock, MockProxy } from 'vitest-mock-extended'
import { getRepositoryToken } from '@nestjs/typeorm'
import { getFakeComment, getFakeInt } from '@/test/utils'
import {
  CreateCommentOptions,
  DeleteCommentOptions,
  FindManyCommentsByArticleOptions,
  FindManyCommentsByAuthorOptions,
  FindOneCommentOptions,
  UpdateCommentOptions,
} from '@/comments/types'
import { createMockTypeOrmQueryBuilder } from '@/test/mocks'
import Paginator from 'typeorm-cursor-pagination/lib/Paginator'
import { buildPaginator } from 'typeorm-cursor-pagination'

vi.mock('typeorm-cursor-pagination', () => ({
  buildPaginator: vi.fn(),
}))

describe('CommentsService', () => {
  let commentsService: CommentsService
  let commentsRepository: MockProxy<Repository<Comment>>
  let paginator: MockProxy<Paginator<Comment>>

  beforeEach(async () => {
    commentsRepository = mock<Repository<Comment>>()
    paginator = mock<Paginator<Comment>>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: commentsRepository,
        },
      ],
    }).compile()

    commentsService = module.get<CommentsService>(CommentsService)
  })

  describe('create', () => {
    test('should create a root comment', async () => {
      const comment = getFakeComment({ parentCommentId: null })
      const options: CreateCommentOptions = {
        authorId: comment.authorId,
        articleId: comment.articleId,
        content: comment.content,
      }

      commentsRepository.save.mockResolvedValue(comment)
      commentsRepository.findOneBy.mockResolvedValue(comment)

      const result = await commentsService.create(options)

      expect(commentsRepository.save).toHaveBeenCalledWith(options)
      expect(commentsRepository.findOneBy).toHaveBeenCalledWith({
        id: comment.id,
      })
      expect(result).toEqual(comment)
    })

    test('should create a child comment', async () => {
      const comment = getFakeComment()
      const options: CreateCommentOptions = {
        authorId: comment.authorId,
        articleId: comment.articleId,
        parentCommentId: comment.parentCommentId,
        content: comment.content,
      }

      commentsRepository.save.mockResolvedValue(comment)
      commentsRepository.findOneBy.mockResolvedValue(comment)

      const result = await commentsService.create(options)

      expect(commentsRepository.save).toHaveBeenCalledWith(options)
      expect(commentsRepository.findOneBy).toHaveBeenCalledWith({
        id: comment.id,
      })
      expect(result).toEqual(comment)
    })
  })

  describe('findOne', () => {
    test('should find a comment', async () => {
      const comment = getFakeComment()
      const options: FindOneCommentOptions = { id: comment.id }

      commentsRepository.findOneBy.mockResolvedValue(comment)

      const result = await commentsService.findOne(options)

      expect(commentsRepository.findOneBy).toHaveBeenCalledWith(options)
      expect(result).toEqual(comment)
    })

    test('should not found', async () => {
      const options: FindOneCommentOptions = { id: getFakeInt() }

      commentsRepository.findOneBy.mockResolvedValue(null)

      const result = await commentsService.findOne(options)

      expect(commentsRepository.findOneBy).toHaveBeenCalledWith(options)
      expect(result).toBeNull()
    })
  })

  describe('findManyByArticle', () => {
    let comments: Comment[]
    let queryBuilder: SelectQueryBuilder<Comment>

    beforeEach(async () => {
      comments = Array.from({ length: 100 }).map(() => getFakeComment())
      queryBuilder = createMockTypeOrmQueryBuilder({ getMany: comments })
      commentsRepository.createQueryBuilder.mockReturnValue(queryBuilder)
      vi.mocked(buildPaginator<Comment>).mockReturnValue(paginator)
    })

    test('should find a root comments', async () => {
      const options: FindManyCommentsByArticleOptions = {
        articleId: getFakeInt(),
      }
      const {
        articleId,
        limit = 10,
        orderBy = 'DESC',
        sortBy = 'rating',
      } = options

      paginator.paginate.mockResolvedValue({
        data: comments,
        cursor: { beforeCursor: null, afterCursor: 'next-cursor' },
      })

      const result = await commentsService.findManyByArticle(options)

      expect(commentsRepository.createQueryBuilder).toHaveBeenCalledWith(
        'comment',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'comment.author',
        'author',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'comment.article',
        'article',
      )
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'comment.articleId = :articleId',
        { articleId },
      )
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'comment.parentCommentId IS NULL',
      )
      expect(buildPaginator).toHaveBeenCalledWith({
        entity: Comment,
        alias: 'comment',
        query: { limit, order: orderBy },
        paginationKeys: [sortBy, 'id'],
      })
      expect(paginator.paginate).toHaveBeenCalledWith(queryBuilder)
      expect(result).toEqual({
        items: comments,
        meta: { cursor: 'next-cursor' },
      })
    })

    test('should find next page of root comments using cursor', async () => {
      const options: FindManyCommentsByArticleOptions = {
        articleId: getFakeInt(),
        cursor: 'next-cursor',
      }
      const {
        articleId,
        cursor,
        limit = 10,
        orderBy = 'DESC',
        sortBy = 'rating',
      } = options

      paginator.paginate.mockResolvedValue({
        data: comments,
        cursor: {
          beforeCursor: 'previous-cursor',
          afterCursor: 'next-cursor',
        },
      })

      const result = await commentsService.findManyByArticle(options)

      expect(commentsRepository.createQueryBuilder).toHaveBeenCalledWith(
        'comment',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'comment.author',
        'author',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'comment.article',
        'article',
      )
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'comment.articleId = :articleId',
        { articleId },
      )
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'comment.parentCommentId IS NULL',
      )
      expect(buildPaginator).toHaveBeenCalledWith({
        entity: Comment,
        alias: 'comment',
        query: { afterCursor: cursor, limit, order: orderBy },
        paginationKeys: [sortBy, 'id'],
      })
      expect(paginator.paginate).toHaveBeenCalledWith(queryBuilder)
      expect(result).toEqual({
        items: comments,
        meta: { cursor: 'next-cursor' },
      })
    })

    test('should find a child comments', async () => {
      const options: FindManyCommentsByArticleOptions = {
        articleId: getFakeInt(),
        parentCommentId: getFakeInt(),
      }
      const {
        articleId,
        limit = 10,
        orderBy = 'DESC',
        parentCommentId,
        sortBy = 'rating',
      } = options

      paginator.paginate.mockResolvedValue({
        data: comments,
        cursor: { beforeCursor: null, afterCursor: 'next-cursor' },
      })

      const result = await commentsService.findManyByArticle(options)

      expect(commentsRepository.createQueryBuilder).toHaveBeenCalledWith(
        'comment',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'comment.author',
        'author',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'comment.article',
        'article',
      )
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'comment.articleId = :articleId',
        { articleId },
      )
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'comment.parentCommentId = :parentCommentId',
        {
          parentCommentId,
        },
      )
      expect(buildPaginator).toHaveBeenCalledWith({
        entity: Comment,
        alias: 'comment',
        query: { limit, order: orderBy },
        paginationKeys: [sortBy, 'id'],
      })
      expect(paginator.paginate).toHaveBeenCalledWith(queryBuilder)
      expect(result).toEqual({
        items: comments,
        meta: { cursor: 'next-cursor' },
      })
    })

    test('should find next page of child comments using cursor', async () => {
      const options: FindManyCommentsByArticleOptions = {
        articleId: getFakeInt(),
        cursor: 'next-cursor',
        parentCommentId: getFakeInt(),
      }
      const {
        articleId,
        cursor,
        limit = 10,
        orderBy = 'DESC',
        parentCommentId,
        sortBy = 'rating',
      } = options

      paginator.paginate.mockResolvedValue({
        data: comments,
        cursor: { beforeCursor: 'previous-cursor', afterCursor: 'next-cursor' },
      })

      const result = await commentsService.findManyByArticle(options)

      expect(commentsRepository.createQueryBuilder).toHaveBeenCalledWith(
        'comment',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'comment.author',
        'author',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'comment.article',
        'article',
      )
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'comment.articleId = :articleId',
        { articleId },
      )
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'comment.parentCommentId = :parentCommentId',
        {
          parentCommentId,
        },
      )
      expect(buildPaginator).toHaveBeenCalledWith({
        entity: Comment,
        alias: 'comment',
        query: { afterCursor: cursor, limit, order: orderBy },
        paginationKeys: [sortBy, 'id'],
      })
      expect(paginator.paginate).toHaveBeenCalledWith(queryBuilder)
      expect(result).toEqual({
        items: comments,
        meta: { cursor: 'next-cursor' },
      })
    })
  })

  describe('findManyByAuthor', () => {
    test('should find a comments', async () => {
      const comments = Array.from({ length: 50 }).map(() => getFakeComment())
      const options: FindManyCommentsByAuthorOptions = {
        authorId: getFakeInt(),
      }
      const {
        authorId,
        limit = 10,
        orderBy = 'DESC',
        sortBy = 'rating',
      } = options

      const queryBuilder = createMockTypeOrmQueryBuilder({ getMany: comments })
      commentsRepository.createQueryBuilder.mockReturnValue(queryBuilder)
      vi.mocked(buildPaginator<Comment>).mockReturnValue(paginator)

      paginator.paginate.mockResolvedValue({
        data: comments,
        cursor: { beforeCursor: null, afterCursor: 'next-cursor' },
      })

      const result = await commentsService.findManyByAuthor(options)

      expect(commentsRepository.createQueryBuilder).toHaveBeenCalledWith(
        'comment',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'comment.author',
        'author',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'comment.article',
        'article',
      )
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'comment.authorId = :authorId',
        { authorId },
      )
      expect(buildPaginator).toHaveBeenCalledWith({
        entity: Comment,
        alias: 'comment',
        query: { limit, order: orderBy },
        paginationKeys: [sortBy, 'id'],
      })
      expect(paginator.paginate).toHaveBeenCalledWith(queryBuilder)
      expect(result).toEqual({
        items: comments,
        meta: { cursor: 'next-cursor' },
      })
    })
  })

  describe('update', () => {
    test('should update a comment', async () => {
      const comment = getFakeComment({ id: 1 })
      const options: UpdateCommentOptions = {
        where: { id: 1 },
        data: {
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Edited' }],
              },
            ],
          },
        },
      }

      commentsRepository.findOneBy.mockResolvedValue({
        ...comment,
        ...options.data,
      })

      const result = await commentsService.update(options)

      expect(commentsRepository.update).toHaveBeenCalledWith(
        options.where,
        options.data,
      )
      expect(commentsRepository.findOneBy).toHaveBeenCalledWith(options.where)
      expect(result).toEqual({ ...comment, ...options.data })
    })
  })

  describe('delete', () => {
    test('should delete a comment', async () => {
      const comment = getFakeComment({ id: 1 })
      const options: DeleteCommentOptions = { id: 1 }

      commentsRepository.findOneBy.mockResolvedValue(comment)

      const result = await commentsService.delete(options)

      expect(commentsRepository.delete).toHaveBeenCalledWith(options)
      expect(commentsRepository.findOneBy).toHaveBeenCalledWith({
        id: comment.id,
      })
      expect(result).toEqual(comment)
    })
  })
})
