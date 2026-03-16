import { Injectable } from '@nestjs/common'
import {
  CreateOptions,
  CreateReturn,
  FindUniqueOptions,
  FindUniqueReturn,
  FindManyOptions,
  FindManyReturn,
  UpdateOptions,
  UpdateReturn,
  DeleteOptions,
  DeleteReturn,
} from '@/articles/types'
import { PrismaClient } from '../../generated/prisma/client'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prismaClient: TransactionHost<
      TransactionalAdapterPrisma<PrismaClient>
    >,
  ) {}

  create(options: CreateOptions): CreateReturn {
    return this.prismaClient.tx.article.create(options)
  }

  findUnique(options: FindUniqueOptions): FindUniqueReturn {
    return this.prismaClient.tx.article.findUnique(options)
  }

  findMany(options: FindManyOptions): FindManyReturn {
    return this.prismaClient.tx.article.findMany(options)
  }

  update(options: UpdateOptions): UpdateReturn {
    return this.prismaClient.tx.article.update(options)
  }

  delete(options: DeleteOptions): DeleteReturn {
    return this.prismaClient.tx.article.delete(options)
  }
}
