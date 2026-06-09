import { Test, TestingModule } from '@nestjs/testing'
import { ArticlesService } from './articles.service'
import {
  CreateArticleOptions,
  DeleteArticleOptions,
  ExistsArticleOptions,
  FindManyArticlesOptions,
  FindUniqueArticleOptions,
  UpdateArticleOptions,
} from './types'
import { getFakeArticle, getFakeInt } from '@/test/utils'
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { PrismaClient } from '@/prisma/types'
import { TransactionHost } from '@nestjs-cls/transactional'

describe('ArticlesService', () => {
  let articlesService: ArticlesService
  let txHost: DeepMockProxy<
    TransactionHost<TransactionalAdapterPrisma<PrismaClient>>
  >

  beforeEach(async () => {
    txHost =
      mockDeep<TransactionHost<TransactionalAdapterPrisma<PrismaClient>>>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: TransactionHost, useValue: txHost },
      ],
    }).compile()

    articlesService = module.get<ArticlesService>(ArticlesService)
  })

  describe('create', () => {
    test('should create article', async () => {
      const { authorId, content } = getFakeArticle()
      const options: CreateArticleOptions = { data: { authorId, content } }
      const article = getFakeArticle({ authorId, content })

      txHost.tx.article.create.mockResolvedValue(article)

      const result = await articlesService.create(options)

      expect(txHost.tx.article.create).toHaveBeenCalledWith(options)
      expect(result).toEqual(article)
    })
  })

  describe('findUnique', () => {
    test('should find article', async () => {
      const options: FindUniqueArticleOptions = { where: { id: getFakeInt() } }
      const article = getFakeArticle()

      txHost.tx.article.findUnique.mockResolvedValue(article)

      const result = await articlesService.findUnique(options)

      expect(txHost.tx.article.findUnique).toHaveBeenCalledWith(options)
      expect(result).toEqual(article)
    })

    test('should find null', async () => {
      const options: FindUniqueArticleOptions = { where: { id: getFakeInt() } }

      txHost.tx.article.findUnique.mockResolvedValue(null)

      const result = await articlesService.findUnique(options)

      expect(txHost.tx.article.findUnique).toHaveBeenCalledWith(options)
      expect(result).toBeNull()
    })
  })

  describe('findMany', () => {
    test('should find articles', async () => {
      const options: FindManyArticlesOptions = {
        where: { authorId: 1 },
      }
      const articles = Array.from({ length: 10 }).map(() => getFakeArticle())

      txHost.tx.article.cursorPaginate.mockResolvedValue({
        items: articles,
        meta: { after: null, before: null },
      })

      const result = await articlesService.findMany(options)

      expect(txHost.tx.article.cursorPaginate).toHaveBeenCalledWith(options)
      expect(result).toEqual({
        items: articles,
        meta: {
          after: null,
          before: null,
        },
      })
    })

    test('should find empty', async () => {
      const options: FindManyArticlesOptions = {
        where: { authorId: getFakeInt() },
      }

      txHost.tx.article.cursorPaginate.mockResolvedValue({
        items: [],
        meta: { after: null, before: null },
      })

      const result = await articlesService.findMany(options)

      expect(txHost.tx.article.cursorPaginate).toHaveBeenCalledWith(options)
      expect(result).toEqual({ items: [], meta: { after: null, before: null } })
    })
  })

  describe('update', () => {
    test('should update article', async () => {
      const options: UpdateArticleOptions = {
        where: { id: getFakeInt() },
        data: { content: getFakeArticle() },
      }
      const article = getFakeArticle()

      txHost.tx.article.update.mockResolvedValue(article)

      const result = await articlesService.update(options)

      expect(txHost.tx.article.update).toHaveBeenCalledWith(options)
      expect(result).toEqual(article)
    })
  })

  describe('delete', () => {
    test('should delete article', async () => {
      const options: DeleteArticleOptions = { where: { id: getFakeInt() } }
      const article = getFakeArticle()

      txHost.tx.article.delete.mockResolvedValue(article)

      const result = await articlesService.delete(options)

      expect(txHost.tx.article.delete).toHaveBeenCalledWith(options)
      expect(result).toEqual(article)
    })
  })

  describe('exists', () => {
    test('should return true', async () => {
      const options: ExistsArticleOptions = { where: { id: 1 } }

      txHost.tx.article.exists.mockResolvedValue(true)

      const result = await articlesService.exists(options)

      expect(txHost.tx.article.exists).toHaveBeenCalledWith(options)
      expect(result).toBeTruthy()
    })

    test('should return false', async () => {
      const options: ExistsArticleOptions = { where: { id: 1 } }

      txHost.tx.article.exists.mockResolvedValue(false)

      const result = await articlesService.exists(options)

      expect(txHost.tx.article.exists).toHaveBeenCalledWith(options)
      expect(result).toBeFalsy()
    })
  })
})
