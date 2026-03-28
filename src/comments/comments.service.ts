import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  CreateCommentOptions,
  CreateCommentReturn,
  DeleteCommentOptions,
  DeleteCommentReturn,
  FindManyCommentsByArticleOptions,
  FindManyCommentsByArticleReturn,
  FindManyCommentsByAuthorOptions,
  FindManyCommentsByAuthorReturn,
  FindOneCommentOptions,
  FindOneCommentReturn,
  UpdateCommentOptions,
  UpdateCommentReturn,
} from '@/comments/types'
import { Comment } from '@/comments/entities'
import { buildPaginator } from 'typeorm-cursor-pagination'

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async create(options: CreateCommentOptions): CreateCommentReturn {
    const { id } = await this.commentsRepository.save(options)

    return (await this.findOne({ id }))!
  }

  findOne(options: FindOneCommentOptions): FindOneCommentReturn {
    return this.commentsRepository.findOneBy(options)
  }

  async findManyByArticle(
    options: FindManyCommentsByArticleOptions,
  ): FindManyCommentsByArticleReturn {
    const {
      articleId,
      cursor,
      limit = 10,
      orderBy = 'DESC',
      parentCommentId,
      sortBy = 'rating',
    } = options

    const queryBuilder = this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.article', 'article')
      .where('comment.articleId = :articleId', { articleId })

    if (parentCommentId) {
      queryBuilder.andWhere('comment.parentCommentId = :parentCommentId', {
        parentCommentId,
      })
    } else {
      queryBuilder.andWhere('comment.parentCommentId IS NULL')
    }

    const paginator = buildPaginator({
      entity: Comment,
      alias: 'comment',
      query: { afterCursor: cursor, limit, order: orderBy },
      paginationKeys: [sortBy, 'id'],
    })

    const {
      data,
      cursor: { afterCursor },
    } = await paginator.paginate(queryBuilder)

    return { items: data, meta: { cursor: afterCursor } }
  }

  async findManyByAuthor(
    options: FindManyCommentsByAuthorOptions,
  ): FindManyCommentsByAuthorReturn {
    const {
      authorId,
      cursor,
      limit = 10,
      orderBy = 'DESC',
      sortBy = 'rating',
    } = options

    const queryBuilder = this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.article', 'article')
      .where('comment.authorId = :authorId', { authorId })

    const paginator = buildPaginator({
      entity: Comment,
      alias: 'comment',
      query: { afterCursor: cursor, limit, order: orderBy },
      paginationKeys: [sortBy, 'id'],
    })

    const {
      data,
      cursor: { afterCursor },
    } = await paginator.paginate(queryBuilder)

    return { items: data, meta: { cursor: afterCursor } }
  }

  async update(options: UpdateCommentOptions): UpdateCommentReturn {
    const { where, data } = options

    await this.commentsRepository.update(where, data)

    return (await this.findOne(where))!
  }

  async delete(options: DeleteCommentOptions): DeleteCommentReturn {
    await this.commentsRepository.delete(options)

    return (await this.findOne(options))!
  }
}
