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
import { getFakeArticle, getFakeInt, getFakeUser } from '@/test/utils'
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
      const { author, content } = getFakeArticle()
      const options: CreateArticleOptions = { data: { author, content } }
      const article = getFakeArticle({ author, content })

      txHost.tx.article.create.mockResolvedValue(article)

      const result = await articlesService.create(options)

      expect(txHost.tx.article.create).toHaveBeenCalledWith(options)
      expect(result).toEqual(article)
    })
  })

  describe('findUnique', () => {
    test('should find article', async () => {
      const id = getFakeInt()
      const options: FindUniqueArticleOptions = { where: { id } }
      const article = getFakeArticle({ id })

      txHost.tx.article.findUnique.mockResolvedValue(article)

      const result = await articlesService.findUnique(options)

      expect(txHost.tx.article.findUnique).toHaveBeenCalledWith(options)
      expect(result).toEqual(article)
    })

    test('should find null', async () => {
      const id = getFakeInt()
      const options: FindUniqueArticleOptions = { where: { id } }

      txHost.tx.article.findUnique.mockResolvedValue(null)

      const result = await articlesService.findUnique(options)

      expect(txHost.tx.article.findUnique).toHaveBeenCalledWith(options)
      expect(result).toBeNull()
    })
  })

  describe('findMany', () => {
    test('should find articles', async () => {
      const user = getFakeUser()
      const options: FindManyArticlesOptions = {
        where: { author: { id: user.id } },
      }

      const articles = Array.from({ length: 10 }).map(() =>
        getFakeArticle({ author: user }),
      )

      txHost.tx.article.findMany.mockResolvedValue(articles)

      const result = await articlesService.findMany(options)

      expect(txHost.tx.article.findMany).toHaveBeenCalledWith(options)
      expect(result).toEqual(articles)
    })

    test('should find empty', async () => {
      const options: FindManyArticlesOptions = {
        where: { author: { id: getFakeInt() } },
      }

      txHost.tx.article.findMany.mockResolvedValue([])

      const result = await articlesService.findMany(options)

      expect(txHost.tx.article.findMany).toHaveBeenCalledWith(options)
      expect(result).toEqual([])
    })
  })

  describe('update', () => {
    test('should update article', async () => {
      const id = getFakeInt()
      const { content } = getFakeArticle()
      const options: UpdateArticleOptions = { where: { id }, data: { content } }
      const article = getFakeArticle({ content })

      txHost.tx.article.update.mockResolvedValue(article)

      const result = await articlesService.update(options)

      expect(txHost.tx.article.update).toHaveBeenCalledWith(options)
      expect(result).toEqual(article)
    })
  })

  describe('delete', () => {
    test('should delete article', async () => {
      const id = getFakeInt()
      const options: DeleteArticleOptions = { where: { id } }
      const article = getFakeArticle({ id })

      txHost.tx.article.delete.mockResolvedValue(article)

      const result = await articlesService.delete(options)

      expect(txHost.tx.article.delete).toHaveBeenCalledWith(options)
      expect(result).toEqual(article)
    })
  })

  describe('exists', () => {
    test('should return true', async () => {
      const id = getFakeInt()
      const options: ExistsArticleOptions = { where: { id } }

      txHost.tx.article.count.mockResolvedValue(1)

      const result = await articlesService.exists(options)

      expect(txHost.tx.article.count).toHaveBeenCalledWith(options)
      expect(result).toBeTruthy()
    })

    test('should return false', async () => {
      const id = getFakeInt()
      const options: ExistsArticleOptions = { where: { id } }

      txHost.tx.article.count.mockResolvedValue(0)

      const result = await articlesService.exists(options)

      expect(txHost.tx.article.count).toHaveBeenCalledWith(options)
      expect(result).toBeFalsy()
    })
  })
})
