import { Test, TestingModule } from '@nestjs/testing'
import { ArticlesController } from './articles.controller'
import { ArticlesService } from './articles.service'
import { mock, MockProxy } from 'vitest-mock-extended'
import { getFakeArticle, getFakeInt } from '@/test/utils'
import { CreateArticleDto, UpdateArticleDto } from './dtos'

describe('ArticlesController', () => {
  let articlesController: ArticlesController
  let articlesService: MockProxy<ArticlesService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
    })
      .useMocker(mock)
      .compile()

    articlesController = module.get<ArticlesController>(ArticlesController)
    articlesService = module.get<MockProxy<ArticlesService>>(ArticlesService)
  })

  describe('create', () => {
    test('should be create and return an article', async () => {
      const article = getFakeArticle({ status: 'DRAFT' })
      const body: CreateArticleDto = {
        authorId: article.authorId,
        content: article.content,
      }

      articlesService.create.mockResolvedValue(article)

      const result = await articlesController.create(body)

      expect(articlesService.create).toHaveBeenCalledWith({ data: body })
      expect(result).toEqual(article)
      expect(result.status).toBe('DRAFT')
    })
  })

  describe('findUnique', () => {
    test('should be find and return an article', async () => {
      const article = getFakeArticle()
      const id = article.id

      articlesService.findUnique.mockResolvedValue(article)

      const result = await articlesController.findUnique(id)

      expect(articlesService.findUnique).toHaveBeenCalledWith({ where: { id } })
      expect(result).toEqual(article)
    })

    test('should be find nothing and return a null', async () => {
      const id = getFakeInt()

      articlesService.findUnique.mockResolvedValue(null)

      const result = await articlesController.findUnique(id)

      expect(articlesService.findUnique).toHaveBeenCalledWith({ where: { id } })
      expect(result).toBeNull()
    })
  })

  describe('update', () => {
    test('should be update and return an article', async () => {
      const article = getFakeArticle()
      const id = article.id
      const body: UpdateArticleDto = { content: article.content }

      articlesService.update.mockResolvedValue(article)

      const result = await articlesController.update(id, body)

      expect(articlesService.update).toHaveBeenCalledWith({
        where: { id },
        data: body,
      })
      expect(result).toEqual(article)
    })
  })

  describe('delete', () => {
    test('should be delete and return an article', async () => {
      const article = getFakeArticle()
      const id = article.id

      articlesService.delete.mockResolvedValue(article)

      const result = await articlesController.delete(id)

      expect(articlesService.delete).toHaveBeenCalledWith({ where: { id } })
      expect(result).toEqual(article)
    })
  })
})
