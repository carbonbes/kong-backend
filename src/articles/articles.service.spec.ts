import { Test, TestingModule } from '@nestjs/testing'
import { ArticlesService } from './articles.service'
import {
  CreateOptions,
  DeleteOptions,
  FindManyOptions,
  FindUniqueOptions,
  UpdateOptions,
} from './types'
import { getFakeArticle, getFakeInt } from '@/test/utils'
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended'
import { PrismaClient } from '@/prisma/client'
import { PRISMA_CLIENT } from '@/prisma/consts'

describe('ArticlesService', () => {
  let articlesService: ArticlesService
  let prismaClient: DeepMockProxy<PrismaClient>

  beforeEach(async () => {
    prismaClient = mockDeep<PrismaClient>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: PRISMA_CLIENT, useValue: prismaClient },
      ],
    }).compile()

    articlesService = module.get<ArticlesService>(ArticlesService)
    prismaClient = module.get<DeepMockProxy<PrismaClient>>(PRISMA_CLIENT)
  })

  describe('create', () => {
    test('should be create an article', async () => {
      const { authorId, content } = getFakeArticle()
      const options: CreateOptions = { data: { authorId, content } }
      const article = getFakeArticle()

      prismaClient.article.create.mockResolvedValue(article)

      const result = await articlesService.create(options)

      expect(result).toEqual(article)
      expect(prismaClient.article.create).toHaveBeenCalledWith(options)
    })
  })

  describe('findUnique', () => {
    test('should be find a unique article', async () => {
      const id = getFakeInt()
      const options: FindUniqueOptions = { where: { id } }
      const article = getFakeArticle({ id })

      prismaClient.article.findUnique.mockResolvedValue(article)

      const result = await articlesService.findUnique(options)

      expect(result).toEqual(article)
      expect(prismaClient.article.findUnique).toHaveBeenCalledWith(options)
    })

    test('should be return a null', async () => {
      const id = getFakeInt()
      const options: FindUniqueOptions = { where: { id } }

      prismaClient.article.findUnique.mockResolvedValue(null)

      const result = await articlesService.findUnique(options)

      expect(result).toBeNull()
      expect(prismaClient.article.findUnique).toHaveBeenCalledWith(options)
    })
  })

  describe('findMany', () => {
    test('should be find many articles', async () => {
      const authorId = getFakeInt()
      const options: FindManyOptions = { where: { authorId } }
      const articles = [
        getFakeArticle({ authorId }),
        getFakeArticle({ authorId }),
      ]

      prismaClient.article.findMany.mockResolvedValue(articles)

      const result = await articlesService.findMany(options)

      expect(result).toEqual(articles)
      expect(prismaClient.article.findMany).toHaveBeenCalledWith(options)
    })
  })

  describe('update', () => {
    test('should be update an article', async () => {
      const id = getFakeInt()
      const { content } = getFakeArticle()
      const options: UpdateOptions = { where: { id }, data: { content } }
      const article = getFakeArticle()

      prismaClient.article.update.mockResolvedValue(article)

      const result = await articlesService.update(options)

      expect(result).toEqual(article)
      expect(prismaClient.article.update).toHaveBeenCalledWith(options)
    })
  })

  describe('delete', () => {
    test('should be delete an article', async () => {
      const id = getFakeInt()
      const options: DeleteOptions = { where: { id } }
      const article = getFakeArticle()

      prismaClient.article.delete.mockResolvedValue(article)

      const result = await articlesService.delete(options)

      expect(result).toEqual(article)
      expect(prismaClient.article.delete).toHaveBeenCalledWith(options)
    })
  })
})
