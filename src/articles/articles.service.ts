import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { PrismaClient } from '@/prisma/types'
import {
  CreateArticleOptions,
  CreateArticleReturn,
  DeleteArticleOptions,
  DeleteArticleReturn,
  FindManyArticlesOptions,
  FindManyArticlesReturn,
  FindUniqueArticleOptions,
  FindUniqueArticleReturn,
  UpdateArticleOptions,
  UpdateArticleReturn,
} from '@/articles/types'

@Injectable()
export class ArticlesService {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaClient>
    >,
  ) {}

  create(options: CreateArticleOptions): CreateArticleReturn {
    return this.txHost.tx.article.create(options)
  }

  findUnique(options: FindUniqueArticleOptions): FindUniqueArticleReturn {
    return this.txHost.tx.article.findUnique(options)
  }

  findMany(options: FindManyArticlesOptions): FindManyArticlesReturn {
    return this.txHost.tx.article.paginateWithCursor(options)
  }

  update(options: UpdateArticleOptions): UpdateArticleReturn {
    return this.txHost.tx.article.update(options)
  }

  delete(options: DeleteArticleOptions): DeleteArticleReturn {
    return this.txHost.tx.article.delete(options)
  }
}
