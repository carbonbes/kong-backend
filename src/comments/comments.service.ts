import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@/prisma/types'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { CommentDelegate } from '@/comments/types'
import { EntityService } from '@/shared/prisma/entity/entity.service'

@Injectable()
export class CommentsService extends EntityService<CommentDelegate> {
  constructor(
    readonly txHost: TransactionHost<TransactionalAdapterPrisma<PrismaClient>>,
  ) {
    super(txHost, 'comment')
  }
}
