import { Test, TestingModule } from '@nestjs/testing'
import { CommentsService } from './comments.service'
import { Repository } from 'typeorm'
import { Comment } from '@/comments/entities'
import { mock, MockProxy } from 'vitest-mock-extended'
import { getRepositoryToken } from '@nestjs/typeorm'
import { getFakeComment, getFakeInt } from '@/test/utils'
import {
  CreateCommentOptions,
  DeleteCommentOptions,
  FindManyCommentsOptions,
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
        { provide: getRepositoryToken(Comment), useValue: commentsRepository },
      ],
    }).compile()

    commentsService = module.get<CommentsService>(CommentsService)
  })

  describe('create', () => {
    test('should create a comment', async () => {
      const comment = getFakeComment()
      const options: CreateCommentOptions = {
        authorId: comment.authorId,
        articleId: comment.articleId,
        content: comment.content,
      }

      commentsRepository.save.mockResolvedValue(comment)

      const result = await commentsService.create(options)

      expect(commentsRepository.save).toHaveBeenCalledWith(options)
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

  describe('findMany', () => {
    test('should find a comments', async () => {
      const comments = Array.from({ length: 10 }).map(() => getFakeComment())
      const options: FindManyCommentsOptions = { where: { articleId: 1 } }

      const queryBuilder = createMockTypeOrmQueryBuilder({ getMany: comments })

      commentsRepository.createQueryBuilder.mockReturnValue(queryBuilder)
      const mockedBuildPaginator = vi.mocked(buildPaginator<Comment>)
      mockedBuildPaginator.mockReturnValue(paginator)
      paginator.paginate.mockResolvedValue({
        data: comments,
        cursor: { beforeCursor: 'before', afterCursor: 'after' },
      })

      const result = await commentsService.findMany(options)

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
      expect(queryBuilder.setFindOptions).toHaveBeenCalledWith({
        where: options.where,
      })
      expect(buildPaginator).toHaveBeenCalledWith({
        entity: Comment,
        paginationKeys: ['id'],
        query: {
          limit: 10,
          order: 'ASC',
          afterCursor: options.afterCursor ?? undefined,
        },
      })
      expect(paginator.paginate).toHaveBeenCalledWith(queryBuilder)
      expect(result).toEqual({
        data: comments,
        cursor: { beforeCursor: 'before', afterCursor: 'after' },
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
      expect(result).toEqual(comment)
    })
  })
})
