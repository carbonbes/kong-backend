import { Test, TestingModule } from '@nestjs/testing'
import { ArticlesService } from './articles.service'
import {
  CreateOptions,
  DeleteOptions,
  FindManyOptions,
  FindOneOptions,
  UpdateOptions,
} from './types'
import { getFakeArticle, getFakeInt } from '@/test/utils'
import { mock, MockProxy } from 'vitest-mock-extended'
import { Repository } from 'typeorm'
import { Article } from '@/articles/entities'
import { getRepositoryToken } from '@nestjs/typeorm'
import { NotFoundException } from '@nestjs/common'

describe('ArticlesService', () => {
  let articlesService: ArticlesService
  let articlesRepository: MockProxy<Repository<Article>>

  beforeEach(async () => {
    articlesRepository = mock<Repository<Article>>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: getRepositoryToken(Article), useValue: articlesRepository },
      ],
    }).compile()

    articlesService = module.get<ArticlesService>(ArticlesService)
  })

  describe('create', () => {
    test('should create an article', async () => {
      const { author, content } = getFakeArticle()
      const options: CreateOptions = { author, content }
      const article = getFakeArticle({ author, content })

      articlesRepository.save.mockResolvedValue(article)

      const result = await articlesService.create(options)

      expect(articlesRepository.save).toHaveBeenCalledWith(options)
      expect(result).toEqual(article)
    })
  })

  describe('findOne', () => {
    test('should find an article', async () => {
      const id = getFakeInt()
      const options: FindOneOptions = { id }
      const article = getFakeArticle({ id })

      articlesRepository.findOneBy.mockResolvedValue(article)

      const result = await articlesService.findOne(options)

      expect(articlesRepository.findOneBy).toHaveBeenCalledWith(options)
      expect(result).toEqual(article)
    })

    test('should return a null', async () => {
      const id = getFakeInt()
      const options: FindOneOptions = { id }

      articlesRepository.findOneBy.mockResolvedValue(null)

      const result = await articlesService.findOne(options)

      expect(articlesRepository.findOneBy).toHaveBeenCalledWith(options)
      expect(result).toBeNull()
    })
  })

  describe('findMany', () => {
    test('should find an articles', async () => {
      const options: FindManyOptions = { id: 1 }

      const articles = [getFakeArticle({ id: 1 })]

      const queryBuilder = {
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue(articles),
      }

      articlesRepository.createQueryBuilder.mockReturnValue(queryBuilder)

      const result = await articlesService.findMany(options)

      expect(articlesRepository.createQueryBuilder).toHaveBeenCalledWith(
        'article',
      )
      expect(queryBuilder.where).toHaveBeenCalledWith('article.id > :id', {
        id: articles[0].id,
      })
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('article.id', 'DESC')
      expect(queryBuilder.getMany).toHaveBeenCalled()
      expect(result).toEqual(articles)
    })
  })

  describe('update', () => {
    test('should update an article', async () => {
      const id = getFakeInt()
      const { content } = getFakeArticle()
      const options: UpdateOptions = { where: { id }, data: { content } }
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
      const options: DeleteOptions = { id }
      const article = getFakeArticle({ id })

      articlesRepository.findOneBy.mockResolvedValue(article)

      const result = await articlesService.delete(options)

      expect(articlesRepository.findOneBy).toHaveBeenCalledWith(options)
      expect(articlesRepository.delete).toHaveBeenCalledWith(options)
      expect(result).toEqual(article)
    })

    test('should return a null', async () => {
      const id = getFakeInt()
      const options: DeleteOptions = { id }

      articlesRepository.findOneBy.mockResolvedValue(null)

      await expect(articlesService.delete(options)).rejects.toThrow(
        NotFoundException,
      )
      expect(articlesRepository.findOneBy).toHaveBeenCalledWith(options)
    })
  })
})
