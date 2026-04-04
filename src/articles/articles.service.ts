import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Prisma, PrismaClient } from '@/prisma/types'

@Injectable()
export class ArticlesService {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaClient>
    >,
  ) {}

  create(options: Prisma.ArticleCreateArgs) {
    return this.txHost.tx.article.create(options)
  }

  findUnique(options: Prisma.ArticleFindUniqueArgs) {
    return this.txHost.tx.article.findUnique(options)
  }

  findMany(options: Prisma.ArticleFindManyArgs) {
    return this.txHost.tx.article.findMany(options)
  }

  update(options: Prisma.ArticleUpdateArgs) {
    return this.txHost.tx.article.update(options)
  }

  delete(options: Prisma.ArticleDeleteArgs) {
    return this.txHost.tx.article.delete(options)
  }
}
