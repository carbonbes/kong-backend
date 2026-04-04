import { Injectable } from '@nestjs/common'
import {
  CreateArticleOptions,
  CreateArticleReturn,
  DeleteArticleOptions,
  DeleteArticleReturn,
  FindManyArticlesByAuthorOptions,
  FindManyArticlesByAuthorReturn,
  FindManyArticlesBySubsiteOptions,
  FindManyArticlesBySubsiteReturn,
  FindOneArticleOptions,
  FindOneArticleReturn,
  UpdateArticleOptions,
  UpdateArticleReturn,
} from '@/articles/types'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Article } from '@/articles/entities'
import { buildPaginator } from 'typeorm-cursor-pagination'

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
  ) {}

  async create(options: CreateArticleOptions): CreateArticleReturn {
    const { id } = await this.articlesRepository.save(options)

    return (await this.findOne({ id }))!
  }

  findOne(options: FindOneArticleOptions): FindOneArticleReturn {
    return this.articlesRepository.findOneBy(options)
  }

  async findManyByAuthor(
    options: FindManyArticlesByAuthorOptions,
  ): FindManyArticlesByAuthorReturn {
    const {
      authorId,
      cursor,
      limit = 10,
      orderBy = 'DESC',
      sortBy = 'rating',
      select,
    } = options

    const queryBuilder = this.articlesRepository
      .createQueryBuilder('article')
      .where('article.authorId = :authorId', { authorId })

    if (select && select.author) {
      queryBuilder.leftJoinAndSelect('article.author', 'author')
    }

    if (select && select.subsite) {
      queryBuilder.leftJoinAndSelect('article.subsite', 'subsite')
    }

    const paginator = buildPaginator({
      entity: Article,
      alias: 'article',
      query: { afterCursor: cursor, limit, order: orderBy },
      paginationKeys: [sortBy, 'id'],
    })

    const {
      data,
      cursor: { afterCursor },
    } = await paginator.paginate(queryBuilder)

    return { items: data, meta: { cursor: afterCursor } }
  }

  async findManyBySubsite(
    options: FindManyArticlesBySubsiteOptions,
  ): FindManyArticlesBySubsiteReturn {
    const {
      subsiteId,
      cursor,
      limit = 10,
      orderBy = 'DESC',
      sortBy = 'rating',
      select,
    } = options

    const queryBuilder = this.articlesRepository
      .createQueryBuilder('article')
      .where('article.subsiteId = :subsiteId', { subsiteId })

    if (select && select.author) {
      queryBuilder.leftJoinAndSelect('article.author', 'author')
    }

    if (select && select.subsite) {
      queryBuilder.leftJoinAndSelect('article.subsite', 'subsite')
    }

    const paginator = buildPaginator({
      entity: Article,
      alias: 'article',
      query: { afterCursor: cursor, limit, order: orderBy },
      paginationKeys: [sortBy, 'id'],
    })

    const {
      data,
      cursor: { afterCursor },
    } = await paginator.paginate(queryBuilder)

    return { items: data, meta: { cursor: afterCursor } }
  }

  async update(options: UpdateArticleOptions): UpdateArticleReturn {
    const { where, data } = options

    await this.articlesRepository.update(where, data)

    return (await this.findOne(where))!
  }

  async delete(options: DeleteArticleOptions): DeleteArticleReturn {
    const article = (await this.findOne(options))!

    await this.articlesRepository.delete(options)

    return article
  }
}
