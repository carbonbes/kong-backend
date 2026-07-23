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
    return (this.txHost.tx[this.modelName] as any).create(options)
  }

  findUnique(
    options: FindUniqueOptions<T>,
  ): FindUniqueReturn<T, FindUniqueOptions<T>> {
    return (this.txHost.tx[this.modelName] as any).findUnique(options)
  }

  findMany(options: FindManyOptions<T>): FindManyReturn<T> {
    return (this.txHost.tx[this.modelName] as any).cursorPaginate(options)
  }

  update(options: UpdateOptions<T>): UpdateReturn<T, UpdateOptions<T>> {
    return (this.txHost.tx[this.modelName] as any).update(options)
  }

  delete(options: DeleteOptions<T>): DeleteReturn<T, DeleteOptions<T>> {
    return (this.txHost.tx[this.modelName] as any).delete(options)
  }

  exists(options: ExistsOptions<T>): ExistsReturn {
    return (this.txHost.tx[this.modelName] as any).exists(options)
  }
}
