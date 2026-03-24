import { Injectable, NotFoundException } from '@nestjs/common'
import {
  CreateOptions,
  CreateReturn,
  FindOneOptions,
  FindOneReturn,
  FindManyOptions,
  FindManyReturn,
  UpdateOptions,
  UpdateReturn,
  DeleteOptions,
  DeleteReturn,
  FindCommentsOptions,
  FindCommentsReturn,
} from '@/articles/types'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Article } from '@/articles/entities'
import { CommentsService } from '@/comments/comments.service'

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    private readonly commentsService: CommentsService,
  ) {}

  create(options: CreateOptions): CreateReturn {
    return this.articlesRepository.save(options)
  }

  findOne(options: FindOneOptions): FindOneReturn {
    return this.articlesRepository.findOneBy(options)
  }

  findMany(options: FindManyOptions): FindManyReturn {
    return this.articlesRepository.find(options)
  }

  async update(options: UpdateOptions): UpdateReturn {
    const { where, data } = options

    await this.articlesRepository.update(where, data)

    return (await this.findOne(where))!
  }

  async delete(options: DeleteOptions): DeleteReturn {
    const article = await this.findOne(options)

    if (!article) {
      throw new NotFoundException()
    }

    await this.articlesRepository.delete(options)

    return article
  }

  findComments({ id: articleId }: FindCommentsOptions): FindCommentsReturn {
    return this.commentsService.findAll({ articleId })
  }
}
