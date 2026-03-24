import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  CreateOptions,
  CreateReturn,
  DeleteOptions,
  DeleteReturn,
  FindAllOptions,
  FindAllReturn,
  FindManyOptions,
  FindManyReturn,
  FindOneOptions,
  FindOneReturn,
  UpdateOptions,
  UpdateReturn,
} from '@/comments/types'
import { Comment } from '@/comments/entities'
import { buildPaginator } from 'typeorm-cursor-pagination'

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async create(options: CreateOptions): CreateReturn {
    const { id } = await this.commentsRepository.save(options)

    return (await this.findOne({ id }))!
  }

  findOne(options: FindOneOptions): FindOneReturn {
    return this.commentsRepository.findOneBy(options)
  }

  findMany(options: FindManyOptions): FindManyReturn {
    const { where, afterCursor } = options

    const queryBuilder = this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.article', 'article')
      .setFindOptions({ where })

    const paginator = buildPaginator({
      entity: Comment,
      paginationKeys: ['id'],
      query: {
        limit: 10,
        order: 'ASC',
        afterCursor: afterCursor ?? undefined,
      },
    })

    return paginator.paginate(queryBuilder)
  }

  findAll(options: FindAllOptions): FindAllReturn {
    return this.commentsRepository.findBy(options)
  }

  async update(options: UpdateOptions): UpdateReturn {
    const { where, data } = options

    await this.commentsRepository.update(where, data)

    return (await this.findOne(where))!
  }

  async delete(options: DeleteOptions): DeleteReturn {
    await this.commentsRepository.delete(options)

    return (await this.findOne(options))!
  }
}
