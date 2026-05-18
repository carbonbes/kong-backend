import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import {
  CreateOptions,
  CreateReturn,
  DeleteOptions,
  DeleteReturn,
  ExistsOptions,
  ExistsReturn,
  FindManyOptions,
  FindManyReturn,
  FindUniqueOptions,
  FindUniqueReturn,
  Prisma,
  PrismaClient,
  UpdateOptions,
  UpdateReturn,
} from './types'

@Injectable()
export abstract class PrismaModelService<T> {
  protected constructor(
    readonly txHost: TransactionHost<TransactionalAdapterPrisma<PrismaClient>>,
    readonly modelName: Lowercase<Prisma.ModelName>,
  ) {}

  create(options: CreateOptions<T>): CreateReturn<T, CreateOptions<T>> {
    return this.txHost.tx[this.modelName].create(options)
  }

  findUnique(
    options: FindUniqueOptions<T>,
  ): FindUniqueReturn<T, FindUniqueOptions<T>> {
    return this.txHost.tx[this.modelName].findUnique(options)
  }

  findMany(options: FindManyOptions<T>): FindManyReturn<T> {
    const { after, before, limit, ...etc } = options

    return this.txHost.tx[this.modelName]
      .paginate(etc)
      .withCursor({ after, before, limit })
  }

  update(options: UpdateOptions<T>): UpdateReturn<T, UpdateOptions<T>> {
    return this.txHost.tx[this.modelName].update(options)
  }

  delete(options: DeleteOptions<T>): DeleteReturn<T, DeleteOptions<T>> {
    return this.txHost.tx[this.modelName].delete(options)
  }

  exists(options: ExistsOptions<T>): ExistsReturn {
    return this.txHost.tx[this.modelName].exists(options)
  }
}
