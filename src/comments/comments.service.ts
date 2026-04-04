import { Injectable } from '@nestjs/common'
import { Prisma, PrismaClient } from '@/prisma/types'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'

@Injectable()
export class CommentsService {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaClient>
    >,
  ) {}

  create(options: Prisma.CommentCreateArgs) {
    return this.txHost.tx.comment.create(options)
  }

  findUnique(options: Prisma.CommentFindUniqueArgs) {
    return this.txHost.tx.comment.findUnique(options)
  }

  findMany(options: Prisma.CommentFindManyArgs) {
    return this.txHost.tx.comment.findMany(options)
  }

  update(options: Prisma.CommentUpdateArgs) {
    return this.txHost.tx.comment.update(options)
  }

  delete(options: Prisma.CommentDeleteArgs) {
    return this.txHost.tx.comment.delete(options)
  }
}
