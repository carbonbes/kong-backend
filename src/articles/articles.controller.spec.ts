import { Test, TestingModule } from '@nestjs/testing'
import { ArticlesController } from './articles.controller'
import { ArticlesService } from './articles.service'
import { mock, MockProxy } from 'vitest-mock-extended'
import { getFakeArticle, getFakeComment, getFakeInt } from '@/test/utils'
import {
  CreateArticleDto,
  FindManyArticlesQueryDto,
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
    test('should create and return article', async () => {
      const authorId = getFakeInt()
      const article = getFakeArticle({
        authorId,
        status: ArticleStatus.draft,
      })
      const body: CreateArticleDto = {
        content: article.content,
      }
      const options: CreateArticleOptions = {
        data: { authorId, content: body.content },
      }

      articlesService.create.mockResolvedValue(article)

      const result = await articlesController.create(authorId, body)

      expect(articlesService.create).toHaveBeenCalledWith(options)
      expect(result).toEqual(article)
    })
  })

  describe('findUnique', () => {
    test('should find and return article', async () => {
      const article = getFakeArticle()

      articlesService.findUnique.mockResolvedValue(article)

      const result = await articlesController.findUnique(article.id)

      expect(articlesService.findUnique).toHaveBeenCalledWith({
        where: { id: article.id },
      })
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
    describe('subsite', () => {
      test('should find and return articles', async () => {
        const articles = Array.from({ length: 10 }).map(() => getFakeArticle())
        const query: FindManyArticlesQueryDto = {
          sortBy: 'rating',
          subsiteId: 1,
        }

        const {
          after,
          before,
          limit,
          orderBy,
          sortBy = 'rating',
          ...where
        } = query

        articlesService.findMany.mockResolvedValue({
          items: articles,
          meta: { after: null, before: null },
        })

        const result = await articlesController.findMany(query)

        expect(articlesService.findMany).toHaveBeenCalledWith({
          after,
          before,
          limit,
          orderBy,
          paginationKeys: ['id', sortBy],
          where,
        })
        expect(result).toEqual({
          items: articles,
          meta: { after: null, before: null },
        })
      })

      test('should not found and return empty array', async () => {
        const query: FindManyArticlesQueryDto = {
          limit: 10,
          subsiteId: 1,
        }

        const {
          after,
          before,
          limit,
          orderBy,
          sortBy = 'rating',
          ...where
        } = query

        articlesService.findMany.mockResolvedValue({
          items: [],
          meta: { after: null, before: null },
        })

        const result = await articlesController.findMany(query)

        expect(articlesService.findMany).toHaveBeenCalledWith({
          after,
          before,
          limit,
          orderBy,
          paginationKeys: ['id', sortBy],
          where,
        })
        expect(result).toEqual({
          items: [],
          meta: { after: null, before: null },
        })
      })
    })

    describe('user', () => {
      test('should find and return articles', async () => {
        const articles = Array.from({ length: 10 }).map(() => getFakeArticle())
        const query: FindManyArticlesQueryDto = {
          authorId: 1,
          sortBy: 'rating',
        }

        const {
          after,
          before,
          limit,
          orderBy,
          sortBy = 'rating',
          ...where
        } = query

        articlesService.findMany.mockResolvedValue({
          items: articles,
          meta: { after: null, before: null },
        })

        const result = await articlesController.findMany(query)

        expect(articlesService.findMany).toHaveBeenCalledWith({
          after,
          before,
          limit,
          orderBy,
          paginationKeys: ['id', sortBy],
          where,
        })
        expect(result).toEqual({
          items: articles,
          meta: { after: null, before: null },
        })
      })

      test('should not found and return empty array', async () => {
        const query: FindManyArticlesQueryDto = {
          authorId: 1,
          limit: 10,
        }

        const {
          after,
          before,
          limit,
          orderBy,
          sortBy = 'rating',
          ...where
        } = query

        articlesService.findMany.mockResolvedValue({
          items: [],
          meta: { after: null, before: null },
        })

        const result = await articlesController.findMany(query)

        expect(articlesService.findMany).toHaveBeenCalledWith({
          after,
          before,
          limit,
          orderBy,
          paginationKeys: ['id', sortBy],
          where,
        })
        expect(result).toEqual({
          items: [],
          meta: { after: null, before: null },
        })
      })
    })
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
