import { Test, TestingModule } from '@nestjs/testing'
import { ArticlesService } from './articles.service'
import {
  CreateArticleOptions,
  DeleteArticleOptions,
  FindManyArticlesByAuthorOptions,
  FindManyArticlesBySubsiteOptions,
  FindOneArticleOptions,
  UpdateArticleOptions,
} from './types'
import { getFakeArticle, getFakeInt } from '@/test/utils'
import { mock, MockProxy } from 'vitest-mock-extended'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { Article } from '@/articles/entities'
import { getRepositoryToken } from '@nestjs/typeorm'
import { createMockTypeOrmQueryBuilder } from '@/test/mocks'
import Paginator from 'typeorm-cursor-pagination/lib/Paginator'
import { buildPaginator } from 'typeorm-cursor-pagination'

vi.mock('typeorm-cursor-pagination', () => ({
  buildPaginator: vi.fn(),
}))

describe('ArticlesService', () => {
  let articlesService: ArticlesService
  let articlesRepository: MockProxy<Repository<Article>>
  let paginator: MockProxy<Paginator<Article>>

  beforeEach(async () => {
    articlesRepository = mock<Repository<Article>>()
    paginator = mock<Paginator<Article>>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(Article),
          useValue: articlesRepository,
        },
      ],
    }).compile()

    articlesService = module.get<ArticlesService>(ArticlesService)
  })

  describe('create', () => {
    test('should create an article', async () => {
      const { authorId, content } = getFakeArticle()
      const options: CreateArticleOptions = { authorId, content }
      const article = getFakeArticle({ authorId, content })

      articlesRepository.save.mockResolvedValue(article)
      articlesRepository.findOneBy.mockResolvedValue(article)

      const result = await articlesService.create(options)

      expect(articlesRepository.save).toHaveBeenCalledWith(options)
      expect(articlesRepository.findOneBy).toHaveBeenCalledWith({
        id: article.id,
      })
      expect(result).toEqual(article)
    })
  })

  describe('findOne', () => {
    test('should find an article', async () => {
      const id = getFakeInt()
      const options: FindOneArticleOptions = { id }
      const article = getFakeArticle({ id })

      articlesRepository.findOneBy.mockResolvedValue(article)

      const result = await articlesService.findOne(options)

      expect(articlesRepository.findOneBy).toHaveBeenCalledWith(options)
      expect(result).toEqual(article)
    })

    test('should return a null', async () => {
      const id = getFakeInt()
      const options: FindOneArticleOptions = { id }

      articlesRepository.findOneBy.mockResolvedValue(null)

      const result = await articlesService.findOne(options)

      expect(articlesRepository.findOneBy).toHaveBeenCalledWith(options)
      expect(result).toBeNull()
    })
  })

  describe('findManyByAuthor', () => {
    let articles: Article[]
    let queryBuilder: SelectQueryBuilder<Article>

    beforeEach(async () => {
      articles = Array.from({ length: 50 }).map(() => getFakeArticle())
      queryBuilder = createMockTypeOrmQueryBuilder({ getMany: articles })
      articlesRepository.createQueryBuilder.mockReturnValue(queryBuilder)
      vi.mocked(buildPaginator<Article>).mockReturnValue(paginator)
    })

    test('should find a single page of articles by author without author and subsite fields', async () => {
      const options: FindManyArticlesByAuthorOptions = {
        authorId: getFakeInt(),
      }
      const {
        authorId,
        limit = 10,
        orderBy = 'DESC',
        sortBy = 'rating',
      } = options

      paginator.paginate.mockResolvedValue({
        data: articles,
        cursor: { beforeCursor: null, afterCursor: 'next-cursor' },
      })

      const result = await articlesService.findManyByAuthor(options)

      expect(articlesRepository.createQueryBuilder).toHaveBeenCalledWith(
        'article',
      )
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'article.authorId = :authorId',
        { authorId },
      )
      expect(buildPaginator).toHaveBeenCalledWith({
        entity: Article,
        alias: 'article',
        query: { limit, order: orderBy },
        paginationKeys: [sortBy, 'id'],
      })
      expect(paginator.paginate).toHaveBeenCalledWith(queryBuilder)
      expect(result).toEqual({
        items: articles,
        meta: { cursor: 'next-cursor' },
      })
    })

    test('should find a single page of articles by author with author and subsite fields', async () => {
      const options: FindManyArticlesByAuthorOptions = {
        authorId: getFakeInt(),
        select: { author: true, subsite: true },
      }
      const {
        authorId,
        limit = 10,
        orderBy = 'DESC',
        sortBy = 'rating',
      } = options

      paginator.paginate.mockResolvedValue({
        data: articles,
        cursor: { beforeCursor: null, afterCursor: 'next-cursor' },
      })

      const result = await articlesService.findManyByAuthor(options)

      expect(articlesRepository.createQueryBuilder).toHaveBeenCalledWith(
        'article',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'article.author',
        'author',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'article.subsite',
        'subsite',
      )
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'article.authorId = :authorId',
        { authorId },
      )
      expect(buildPaginator).toHaveBeenCalledWith({
        entity: Article,
        alias: 'article',
        query: { limit, order: orderBy },
        paginationKeys: [sortBy, 'id'],
      })
      expect(paginator.paginate).toHaveBeenCalledWith(queryBuilder)
      expect(result).toEqual({
        items: articles,
        meta: { cursor: 'next-cursor' },
      })
    })

    test('should find next page of articles by author using cursor without author and subsite fields', async () => {
      const options: FindManyArticlesByAuthorOptions = {
        authorId: getFakeInt(),
        cursor: 'next-cursor',
      }
      const {
        authorId,
        cursor,
        limit = 10,
        orderBy = 'DESC',
        sortBy = 'rating',
      } = options

      paginator.paginate.mockResolvedValue({
        data: articles,
        cursor: { beforeCursor: 'previous-cursor', afterCursor: 'next-cursor' },
      })

      const result = await articlesService.findManyByAuthor(options)

      expect(articlesRepository.createQueryBuilder).toHaveBeenCalledWith(
        'article',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'article.author',
        'author',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'article.subsite',
        'subsite',
      )
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'article.authorId = :authorId',
        { authorId },
      )
      expect(buildPaginator).toHaveBeenCalledWith({
        entity: Article,
        alias: 'article',
        query: { afterCursor: cursor, limit, order: orderBy },
        paginationKeys: [sortBy, 'id'],
      })
      expect(paginator.paginate).toHaveBeenCalledWith(queryBuilder)
      expect(result).toEqual({
        items: articles,
        meta: { cursor: 'next-cursor' },
      })
    })

    test('should find next page of articles by author using cursor without author and subsite fields', async () => {
      const options: FindManyArticlesByAuthorOptions = {
        authorId: getFakeInt(),
        cursor: 'next-cursor',
      }
      const {
        authorId,
        cursor,
        limit = 10,
        orderBy = 'DESC',
        sortBy = 'rating',
      } = options

      paginator.paginate.mockResolvedValue({
        data: articles,
        cursor: { beforeCursor: 'previous-cursor', afterCursor: 'next-cursor' },
      })

      const result = await articlesService.findManyByAuthor(options)

      expect(articlesRepository.createQueryBuilder).toHaveBeenCalledWith(
        'article',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'article.author',
        'author',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'article.subsite',
        'subsite',
      )
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'article.authorId = :authorId',
        { authorId },
      )
      expect(buildPaginator).toHaveBeenCalledWith({
        entity: Article,
        alias: 'article',
        query: { afterCursor: cursor, limit, order: orderBy },
        paginationKeys: [sortBy, 'id'],
      })
      expect(paginator.paginate).toHaveBeenCalledWith(queryBuilder)
      expect(result).toEqual({
        items: articles,
        meta: { cursor: 'next-cursor' },
      })
    })
  })

  describe('findManyBySubsite', () => {
    let articles: Article[]
    let queryBuilder: SelectQueryBuilder<Article>

    beforeEach(async () => {
      articles = Array.from({ length: 50 }).map(() => getFakeArticle())
      queryBuilder = createMockTypeOrmQueryBuilder({ getMany: articles })
      articlesRepository.createQueryBuilder.mockReturnValue(queryBuilder)
      vi.mocked(buildPaginator<Article>).mockReturnValue(paginator)
    })

    test('should find a single page of articles by subsite', async () => {
      const options: FindManyArticlesBySubsiteOptions = {
        subsiteId: getFakeInt(),
      }
      const {
        subsiteId,
        limit = 10,
        orderBy = 'DESC',
        sortBy = 'rating',
      } = options

      paginator.paginate.mockResolvedValue({
        data: articles,
        cursor: { beforeCursor: null, afterCursor: 'next-cursor' },
      })

      const result = await articlesService.findManyBySubsite(options)

      expect(articlesRepository.createQueryBuilder).toHaveBeenCalledWith(
        'article',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'article.author',
        'author',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'article.subsite',
        'subsite',
      )
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'article.subsiteId = :subsiteId',
        { subsiteId },
      )
      expect(buildPaginator).toHaveBeenCalledWith({
        entity: Article,
        alias: 'article',
        query: { limit, order: orderBy },
        paginationKeys: [sortBy, 'id'],
      })
      expect(paginator.paginate).toHaveBeenCalledWith(queryBuilder)
      expect(result).toEqual({
        items: articles,
        meta: { cursor: 'next-cursor' },
      })
    })

    test('should find next page of articles by subsite using cursor', async () => {
      const options: FindManyArticlesBySubsiteOptions = {
        subsiteId: getFakeInt(),
        cursor: 'next-cursor',
      }
      const {
        subsiteId,
        cursor,
        limit = 10,
        orderBy = 'DESC',
        sortBy = 'rating',
      } = options

      paginator.paginate.mockResolvedValue({
        data: articles,
        cursor: { beforeCursor: 'previous-cursor', afterCursor: 'next-cursor' },
      })

      const result = await articlesService.findManyBySubsite(options)

      expect(articlesRepository.createQueryBuilder).toHaveBeenCalledWith(
        'article',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'article.author',
        'author',
      )
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'article.subsite',
        'subsite',
      )
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'article.subsiteId = :subsiteId',
        { subsiteId },
      )
      expect(buildPaginator).toHaveBeenCalledWith({
        entity: Article,
        alias: 'article',
        query: { afterCursor: cursor, limit, order: orderBy },
        paginationKeys: [sortBy, 'id'],
      })
      expect(paginator.paginate).toHaveBeenCalledWith(queryBuilder)
      expect(result).toEqual({
        items: articles,
        meta: { cursor: 'next-cursor' },
      })
    })
  })

  describe('update', () => {
    test('should update an article', async () => {
      const id = getFakeInt()
      const { content } = getFakeArticle()
      const options: UpdateArticleOptions = { where: { id }, data: { content } }
      const article = getFakeArticle({ content })

      articlesRepository.findOneBy.mockResolvedValue(article)

      const result = await articlesService.update(options)

      expect(articlesRepository.update).toHaveBeenCalledWith(
        options.where,
        options.data,
      )
      expect(articlesRepository.findOneBy).toHaveBeenCalledWith(options.where)
      expect(result).toEqual(article)
    })
  })

  describe('delete', () => {
    test('should delete an article', async () => {
      const id = getFakeInt()
      const options: DeleteArticleOptions = { id }
      const article = getFakeArticle({ id })

      articlesRepository.findOneBy.mockResolvedValue(article)

      const result = await articlesService.delete(options)

      expect(articlesRepository.findOneBy).toHaveBeenCalledWith(options)
      expect(articlesRepository.delete).toHaveBeenCalledWith(options)
      expect(result).toEqual(article)
    })

    test('should return null', async () => {
      const id = getFakeInt()
      const options: DeleteArticleOptions = { id }

      articlesRepository.findOneBy.mockResolvedValue(null)

      const result = await articlesService.delete(options)

      expect(articlesRepository.findOneBy).toHaveBeenCalledWith(options)
      expect(result).toBeNull()
    })
  })
})
