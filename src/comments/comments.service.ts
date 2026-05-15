import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@/prisma/types'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import {
  CreateCommentOptions,
  CreateCommentReturn,
  DeleteCommentOptions,
  DeleteCommentReturn,
  FindManyCommentsOptions,
  FindManyCommentsReturn,
  FindUniqueCommentOptions,
  FindUniqueCommentReturn,
  UpdateCommentOptions,
  UpdateCommentReturn,
} from '@/comments/types'

@Injectable()
export class CommentsService {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaClient>
    >,
  ) {}

  create(options: CreateCommentOptions): CreateCommentReturn {
    return this.txHost.tx.comment.create(options)
  }

  findUnique(options: FindUniqueCommentOptions): FindUniqueCommentReturn {
    return this.txHost.tx.comment.findUnique(options)
  }

  findMany(options: FindManyCommentsOptions): FindManyCommentsReturn {
    return this.txHost.tx.comment.paginateWithCursor(options)
  }

  update(options: UpdateCommentOptions): UpdateCommentReturn {
    return this.txHost.tx.comment.update(options)
  }

  delete(options: DeleteCommentOptions): DeleteCommentReturn {
    return this.txHost.tx.comment.delete(options)
  }
}
