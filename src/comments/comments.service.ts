import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@/prisma/types'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { PrismaModelService } from '@/prisma/prisma-model.service'
import { CommentDelegate } from '../../generated/prisma/models/Comment'

@Injectable()
export class CommentsService extends PrismaModelService<CommentDelegate> {
  constructor(
    readonly txHost: TransactionHost<TransactionalAdapterPrisma<PrismaClient>>,
  ) {
    super(txHost, 'comment')
  }
}
