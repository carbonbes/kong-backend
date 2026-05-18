import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { PrismaClient } from '@/prisma/types'
import { PrismaModelService } from '@/prisma/prisma-model.service'
import { ArticleDelegate } from '@/articles/types'

@Injectable()
export class ArticlesService extends PrismaModelService<ArticleDelegate> {
  constructor(
    readonly txHost: TransactionHost<TransactionalAdapterPrisma<PrismaClient>>,
  ) {
    super(txHost, 'article')
  }
}
