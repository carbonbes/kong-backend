import { Injectable } from '@nestjs/common'
import {
  CreateArticleOptions,
  CreateArticleReturn,
  FindOneArticleOptions,
  FindOneArticleReturn,
  FindManyArticlesOptions,
  FindManyArticlesReturn,
  UpdateArticleOptions,
  UpdateArticleReturn,
  DeleteArticleOptions,
  DeleteArticleReturn,
} from '@/articles/types'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Article } from '@/articles/entities'

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

  findMany(options: FindManyArticlesOptions): FindManyArticlesReturn {
    return this.articlesRepository.find(options)
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
