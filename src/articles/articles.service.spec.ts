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
import { PrismaService } from '@/prisma/prisma.service'

describe('ArticlesService', () => {
  let articlesService: ArticlesService
  let prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArticlesService],
    })
      .useMocker(mockDeep)
      .compile()

    articlesService = module.get<ArticlesService>(ArticlesService)
    prismaService = module.get<DeepMockProxy<PrismaService>>(PrismaService)
  })

  describe('create', () => {
    test('should be create an article', async () => {
      const { authorId, content } = getFakeArticle()
      const options: CreateOptions = { data: { authorId, content } }
      const article = getFakeArticle()

      prismaService.article.create.mockResolvedValue(article)

      const result = await articlesService.create(options)

      expect(result).toEqual(article)
      expect(prismaService.article.create).toHaveBeenCalledWith(options)
    })
  })

  describe('findUnique', () => {
    test('should be find a unique article', async () => {
      const id = getFakeInt()
      const options: FindUniqueOptions = { where: { id } }
      const article = getFakeArticle({ id })

      prismaService.article.findUnique.mockResolvedValue(article)

      const result = await articlesService.findUnique(options)

      expect(result).toEqual(article)
      expect(prismaService.article.findUnique).toHaveBeenCalledWith(options)
    })

    test('should be return a null', async () => {
      const id = getFakeInt()
      const options: FindUniqueOptions = { where: { id } }

      prismaService.article.findUnique.mockResolvedValue(null)

      const result = await articlesService.findUnique(options)

      expect(result).toBeNull()
      expect(prismaService.article.findUnique).toHaveBeenCalledWith(options)
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

      prismaService.article.findMany.mockResolvedValue(articles)

      const result = await articlesService.findMany(options)

      expect(result).toEqual(articles)
      expect(prismaService.article.findMany).toHaveBeenCalledWith(options)
    })
  })

  describe('update', () => {
    test('should be update an article', async () => {
      const id = getFakeInt()
      const { content } = getFakeArticle()
      const options: UpdateOptions = { where: { id }, data: { content } }
      const article = getFakeArticle()

      prismaService.article.update.mockResolvedValue(article)

      const result = await articlesService.update(options)

      expect(result).toEqual(article)
      expect(prismaService.article.update).toHaveBeenCalledWith(options)
    })
  })

  describe('delete', () => {
    test('should be delete an article', async () => {
      const id = getFakeInt()
      const options: DeleteOptions = { where: { id } }
      const article = getFakeArticle()

      prismaService.article.delete.mockResolvedValue(article)

      const result = await articlesService.delete(options)

      expect(result).toEqual(article)
      expect(prismaService.article.delete).toHaveBeenCalledWith(options)
    })
  })
})
