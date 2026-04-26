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

@Injectable()
export abstract class EntityService<T> {
  protected constructor(
    readonly txHost: TransactionHost<TransactionalAdapterPrisma<PrismaClient>>,
    readonly entity: Lowercase<Prisma.ModelName>,
  ) {}

  create(options: CreateOptions<T>): CreateReturn<T> {
    return this.txHost.tx[this.entity].create(options)
  }

  findUnique(options: FindUniqueOptions<T>): FindUniqueReturn<T> {
    return this.txHost.tx[this.entity].findUnique(options)
  }

  findMany(options: FindManyOptions<T>): FindManyReturn<T> {
    return this.txHost.tx[this.entity].findMany(options)
  }

  async findManyWithCursorPagination(
    options: FindManyWithCursorPaginationOptions<T>,
  ): FindManyWithCursorPaginationReturn<T> {
    const items = await this.txHost.tx[this.entity].findMany(options)

    return { items, cursor: '' }
  }

  update(options: UpdateOptions<T>): UpdateReturn<T> {
    return this.txHost.tx[this.entity].update(options)
  }

  delete(options: DeleteOptions<T>): DeleteReturn<T> {
    return this.txHost.tx[this.entity].delete(options)
  }

  async exists(options: ExistsOptions<T>): ExistsReturn {
    return (await this.txHost.tx[this.entity].count(options)) > 0
  }
}
