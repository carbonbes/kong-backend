import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { PrismaClient } from '@/prisma/types'
import { ArticleDelegate } from '@/articles/types'
import { EntityService } from '@/shared/prisma/entity/entity.service'

@Injectable()
export class ArticlesService extends EntityService<ArticleDelegate> {
  constructor(
    readonly txHost: TransactionHost<TransactionalAdapterPrisma<PrismaClient>>,
  ) {
    super(txHost, 'article')
  }
}
