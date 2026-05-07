import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { PrismaClient } from '@/prisma/types'
import {
  CreateOptions,
  CreateReturn,
  DeleteOptions,
  DeleteReturn,
  ExistsOptions,
  ExistsReturn,
  FindManyOptions,
  FindManyReturn,
  FindManyWithCursorPaginationOptions,
  FindManyWithCursorPaginationReturn,
  FindUniqueOptions,
  FindUniqueReturn,
  UpdateOptions,
  UpdateReturn,
} from './types'
import { Prisma } from '@/prisma/types'
import { objectFromBase64, objectToBase64 } from './utils'

@Injectable()
export abstract class EntityService<T> {
  protected constructor(
    readonly txHost: TransactionHost<TransactionalAdapterPrisma<PrismaClient>>,
    readonly modelName: Lowercase<Prisma.ModelName>,
  ) {}

  create(options: CreateOptions<T>): CreateReturn<T> {
    return this.txHost.tx[this.modelName].create(options)
  }

  findUnique(options: FindUniqueOptions<T>): FindUniqueReturn<T> {
    return this.txHost.tx[this.modelName].findUnique(options)
  }

  findMany(options: FindManyOptions<T>): FindManyReturn<T> {
    return this.txHost.tx[this.modelName].findMany(options)
  }

  async findManyWithCursorPagination(
    options: FindManyWithCursorPaginationOptions<T>,
  ): FindManyWithCursorPaginationReturn<T> {
    const {
      after,
      before,
      limit = 10,
      orderBy = 'desc',
      sortBy,
      ...etc
    } = options

    const orderByFields = sortBy
      ? [{ id: orderBy }, { [sortBy]: orderBy }]
      : [{ id: orderBy }]

    const [items, meta] = await this.txHost.tx[this.modelName]
      .paginate({
        ...etc,
        orderBy: orderByFields,
      })
      .withCursor({
        after,
        before,
        limit,
        getCursor: (item) =>
          objectToBase64(
            Object.keys(orderByFields).reduce((acc, key) => {
              acc[key] = item[key]
              return acc
            }, {}),
          ),
        parseCursor: (cursor) => objectFromBase64(cursor),
      })

    return { items, meta }
  }

  update(options: UpdateOptions<T>): UpdateReturn<T> {
    return this.txHost.tx[this.modelName].update(options)
  }

  delete(options: DeleteOptions<T>): DeleteReturn<T> {
    return this.txHost.tx[this.modelName].delete(options)
  }

  async exists(options: ExistsOptions<T>): ExistsReturn<T> {
    return (await this.txHost.tx[this.modelName].count(options)) > 0
  }
}
