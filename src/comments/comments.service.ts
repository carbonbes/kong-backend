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
    const { articleId, limit, sortBy = 'rate', cursor } = options

    const queryBuilder = this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.article', 'article')
      .where('comment.articleId = :articleId', { articleId })
      .andWhere('comment.parentCommentId IS NULL')

    const paginator = buildPaginator({
      entity: Comment,
      alias: 'comment',
      paginationKeys: [sortBy, 'id'],
      query: { afterCursor: cursor, limit, order: 'DESC' },
    })

    const {
      data,
      cursor: { afterCursor },
    } = await paginator.paginate(queryBuilder)

    return { data, cursor: afterCursor }
  }

  findManyByAuthor(
    options: FindManyCommentsByAuthorOptions,
  ): FindManyCommentsByAuthorReturn {
    const { authorId, limit, sortBy } = options

    const queryBuilder = this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.article', 'article')
      .where('comment.authorId = :authorId', { authorId })

    const paginator = buildPaginator({
      entity: Comment,
      alias: 'comment',
      paginationKeys: [sortBy, 'id'],
      query: { limit, order: 'DESC' },
    })

    return paginator.paginate(queryBuilder)
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
