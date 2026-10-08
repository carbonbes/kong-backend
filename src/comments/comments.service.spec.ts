import { Test, TestingModule } from '@nestjs/testing'
import { CommentsService } from './comments.service'
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended'
import { getFakeComment, getFakeInt } from '@/test/utils'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import {
  CreateOptions,
  DeleteOptions,
  ExistsOptions,
  FindUniqueOptions,
  PrismaClient,
  UpdateOptions,
  JsonValue,
} from '@/prisma/types'
import { CommentDelegate } from './types'
import { CursorPaginateOptions } from '@/lib/prisma/extensions/cursor-pagination/types'

describe('CommentsService', () => {
  let commentsService: CommentsService
  let txHost: DeepMockProxy<
    TransactionHost<TransactionalAdapterPrisma<PrismaClient>>
  >

  beforeEach(async () => {
    txHost =
      mockDeep<TransactionHost<TransactionalAdapterPrisma<PrismaClient>>>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: TransactionHost, useValue: txHost },
      ],
    }).compile()

    commentsService = module.get<CommentsService>(CommentsService)
  })

  describe('create', () => {
    test('should create root comment', async () => {
      const comment = getFakeComment({ parentCommentId: null })
      const options: CreateOptions<CommentDelegate> = {
        data: {
          authorId: comment.authorId,
          articleId: comment.articleId,
          content: comment.content,
        },
      }

      txHost.tx.comment.create.mockResolvedValue(comment)

      const result = await commentsService.create(options)

      expect(txHost.tx.comment.create).toHaveBeenCalledWith(options)
      expect(result).toEqual(comment)
    })

    test('should create child comment', async () => {
      const comment = getFakeComment()
      const options: CreateOptions<CommentDelegate> = {
        data: {
          authorId: comment.authorId,
          articleId: comment.articleId,
          parentCommentId: comment.parentCommentId,
          content: comment.content,
        },
      }

      txHost.tx.comment.create.mockResolvedValue(comment)

      const result = await commentsService.create(options)

      expect(txHost.tx.comment.create).toHaveBeenCalledWith(options)
      expect(result).toEqual(comment)
    })
  })

  describe('findUnique', () => {
    test('should find comment', async () => {
      const comment = getFakeComment()
      const options: FindUniqueOptions<CommentDelegate> = {
        where: { id: comment.id },
      }

      txHost.tx.comment.findUnique.mockResolvedValue(comment)

      const result = await commentsService.findUnique(options)

      expect(txHost.tx.comment.findUnique).toHaveBeenCalledWith(options)
      expect(result).toEqual(comment)
    })

    test('should find null', async () => {
      const options: FindUniqueOptions<CommentDelegate> = {
        where: { id: getFakeInt() },
      }

      txHost.tx.comment.findUnique.mockResolvedValue(null)

      const result = await commentsService.findUnique(options)

      expect(txHost.tx.comment.findUnique).toHaveBeenCalledWith(options)
      expect(result).toBeNull()
    })
  })

  describe('findMany', () => {
    test('should find comments', async () => {
      const comments = Array.from({ length: 10 }).map(() => getFakeComment())
      const options: CursorPaginateOptions<CommentDelegate> = {
        where: { articleId: getFakeInt() },
      }

      txHost.tx.comment.cursorPaginate.mockResolvedValue({
        items: comments,
        meta: { after: null, before: null, total: 10 },
      })

      const result = await commentsService.findMany(options)

      expect(txHost.tx.comment.cursorPaginate).toHaveBeenCalledWith(options)
      expect(result).toEqual({
        items: comments,
        meta: { after: null, before: null, total: 10 },
      })
    })

    test('should find empty', async () => {
      const options: CursorPaginateOptions<CommentDelegate> = {
        where: { articleId: getFakeInt() },
      }

      txHost.tx.comment.cursorPaginate.mockResolvedValue({
        items: [],
        meta: { after: null, before: null, total: 0 },
      })

      const result = await commentsService.findMany(options)

      expect(txHost.tx.comment.cursorPaginate).toHaveBeenCalledWith(options)
      expect(result).toEqual({
        items: [],
        meta: { after: null, before: null, total: 0 },
      })
    })
  })

  describe('update', () => {
    test('should update comment', async () => {
      const comment = getFakeComment({ id: 1 })
      const options: UpdateOptions<CommentDelegate> = {
        where: { id: comment.id },
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

      txHost.tx.comment.update.mockResolvedValue({
        ...comment,
        content: options.data.content as JsonValue,
      })

      const result = await commentsService.update(options)

      expect(txHost.tx.comment.update).toHaveBeenCalledWith(options)
      expect(result).toEqual({ ...comment, ...options.data })
    })
  })

  describe('delete', () => {
    test('should delete comment', async () => {
      const comment = getFakeComment()
      const options: DeleteOptions<CommentDelegate> = {
        where: { id: comment.id },
      }

      txHost.tx.comment.delete.mockResolvedValue(comment)

      const result = await commentsService.delete(options)

      expect(txHost.tx.comment.delete).toHaveBeenCalledWith(options)
      expect(result).toEqual(comment)
    })
  })

  describe('exists', () => {
    test('should return true', async () => {
      const options: ExistsOptions<CommentDelegate> = {
        where: { id: getFakeInt() },
      }

      txHost.tx.comment.exists.mockResolvedValue(true)

      const result = await commentsService.exists(options)

      expect(txHost.tx.comment.exists).toHaveBeenCalledWith(options)
      expect(result).toBeTruthy()
    })

    test('should return false', async () => {
      const options: ExistsOptions<CommentDelegate> = {
        where: { id: getFakeInt() },
      }

      txHost.tx.comment.exists.mockResolvedValue(false)

      const result = await commentsService.exists(options)

      expect(txHost.tx.comment.exists).toHaveBeenCalledWith(options)
      expect(result).toBeFalsy()
    })
  })
})
