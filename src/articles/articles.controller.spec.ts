import { Test, TestingModule } from '@nestjs/testing'
import { ArticlesController } from './articles.controller'
import { ArticlesService } from './articles.service'
import { mock, MockProxy } from 'vitest-mock-extended'
import { getFakeArticle, getFakeInt, getFakeUser } from '@/test/utils'
import { CreateArticleDto, UpdateArticleDto } from './dtos'
import { ArticleStatus } from '@/articles/enums'
import { CreateArticleOptions } from '@/articles/types'

describe('ArticlesController', () => {
  let articlesController: ArticlesController
  let articlesService: MockProxy<ArticlesService>

  beforeEach(async () => {
    articlesService = mock<ArticlesService>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: ArticlesService, useValue: articlesService }],
      controllers: [ArticlesController],
    }).compile()

    articlesController = module.get<ArticlesController>(ArticlesController)
  })

  describe('create', () => {
    test('should create and return article', async () => {
      const user = getFakeUser()
      const article = getFakeArticle({
        author: user,
        status: ArticleStatus.draft,
      })
      const body: CreateArticleDto = {
        content: article.content,
      }
      const options: CreateArticleOptions = {
        data: { authorId: user.id, content: body.content },
      }

      articlesService.create.mockResolvedValue(article)

      const result = await articlesController.create(user.id, body)

      expect(articlesService.create).toHaveBeenCalledWith(options)
      expect(result).toEqual(article)
    })
  })

  describe('findUnique', () => {
    test('should find and return article', async () => {
      const article = getFakeArticle()
      const id = article.id

      articlesService.findUnique.mockResolvedValue(article)

      const result = await articlesController.findUnique(id)

      expect(articlesService.findUnique).toHaveBeenCalledWith({ where: { id } })
      expect(result).toEqual(article)
    })

    test('should find nothing and return null', async () => {
      const id = getFakeInt()

      articlesService.findUnique.mockResolvedValue(null)

      const result = await articlesController.findUnique(id)

      expect(articlesService.findUnique).toHaveBeenCalledWith({ where: { id } })
      expect(result).toBeNull()
    })
  })

  describe('findMany', () => {
    test('should find and return articles', async () => {})

    test('should not found and return empty array', async () => {})
  })

  describe('update', () => {
    test('should update and return article', async () => {
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
    test('should delete and return article', async () => {
      const article = getFakeArticle()
      const id = article.id

      articlesService.delete.mockResolvedValue(article)

      const result = await articlesController.delete(id)

      expect(articlesService.delete).toHaveBeenCalledWith({ where: { id } })
      expect(result).toEqual(article)
    })
  })
})
