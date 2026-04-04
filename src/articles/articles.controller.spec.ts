import { Test, TestingModule } from '@nestjs/testing'
import { ArticlesController } from './articles.controller'
import { ArticlesService } from './articles.service'
import { mock, MockProxy } from 'vitest-mock-extended'
import { getFakeArticle, getFakeInt, getFakeUser } from '@/test/utils'
import {
  CreateArticleDto,
  FindManyArticlesByAuthorQueryDto,
  FindManyArticlesBySubsiteQueryDto,
  UpdateArticleDto,
} from './dtos'
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
    test('should create and return an article', async () => {
      const user = getFakeUser()
      const article = getFakeArticle({
        author: user,
        status: ArticleStatus.Draft,
      })
      const body: CreateArticleDto = {
        content: article.content,
      }
      const options: CreateArticleOptions = {
        authorId: user.id,
        content: body.content,
      }

      articlesService.create.mockResolvedValue(article)

      const result = await articlesController.create(user.id, body)

      expect(articlesService.create).toHaveBeenCalledWith(options)
      expect(result).toEqual(article)
    })
  })

  describe('findOne', () => {
    test('should find and return an article', async () => {
      const article = getFakeArticle()
      const id = article.id

      articlesService.findOne.mockResolvedValue(article)

      const result = await articlesController.findOne(id)

      expect(articlesService.findOne).toHaveBeenCalledWith({ id })
      expect(result).toEqual(article)
    })

    test('should find nothing and return a null', async () => {
      const id = getFakeInt()

      articlesService.findOne.mockResolvedValue(null)

      const result = await articlesController.findOne(id)

      expect(articlesService.findOne).toHaveBeenCalledWith({ id })
      expect(result).toBeNull()
    })
  })

  describe('findManyByAuthor', () => {
    test('should find an articles by author', async () => {
      const articles = Array.from({ length: 10 }).map(() => getFakeArticle())
      const userId = 1
      const query: FindManyArticlesByAuthorQueryDto = { limit: 10 }

      articlesService.findManyByAuthor.mockResolvedValue({
        items: articles,
        meta: { cursor: null },
      })

      const result = await articlesController.findManyByAuthor(userId, query)

      expect(articlesService.findManyByAuthor).toHaveBeenCalledWith({
        authorId: userId,
        ...query,
      })
      expect(result).toEqual({
        items: articles,
        meta: { cursor: null },
      })
    })
  })

  describe('findManyBySubsite', () => {
    test('should find an articles by subsite', async () => {
      const articles = Array.from({ length: 10 }).map(() => getFakeArticle())
      const subsiteId = 1
      const query: FindManyArticlesBySubsiteQueryDto = { limit: 10 }

      articlesService.findManyBySubsite.mockResolvedValue({
        items: articles,
        meta: { cursor: null },
      })

      const result = await articlesController.findManyBySubsite(
        subsiteId,
        query,
      )

      expect(articlesService.findManyBySubsite).toHaveBeenCalledWith({
        subsiteId,
        ...query,
      })
      expect(result).toEqual({
        items: articles,
        meta: { cursor: null },
      })
    })
  })

  describe('update', () => {
    test('should update and return an article', async () => {
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
    test('should delete and return an article', async () => {
      const article = getFakeArticle()
      const id = article.id

      articlesService.delete.mockResolvedValue(article)

      const result = await articlesController.delete(id)

      expect(articlesService.delete).toHaveBeenCalledWith({ id })
      expect(result).toEqual(article)
    })
  })
})
