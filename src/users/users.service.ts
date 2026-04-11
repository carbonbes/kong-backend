import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { PrismaClient } from '@/prisma/types'
import {
  CreateUserOptions,
  CreateUserReturn,
  ExistsUserOptions,
  ExistsUserReturn,
  FindManyUsersOptions,
  FindManyUsersReturn,
  FindUniqueUserOptions,
  FindUniqueUserReturn,
  UpdateUserOptions,
  UpdateUserReturn,
} from '@/users/types'

@Injectable()
export class UsersService {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaClient>
    >,
  ) {}

  create(options: CreateUserOptions): CreateUserReturn {
    return this.txHost.tx.user.create(options)
  }

  findUnique(options: FindUniqueUserOptions): FindUniqueUserReturn {
    return this.txHost.tx.user.findUnique(options)
  }

  findMany(options: FindManyUsersOptions): FindManyUsersReturn {
    return this.txHost.tx.user.findMany(options)
  }

  update(options: UpdateUserOptions): UpdateUserReturn {
    return this.txHost.tx.user.update(options)
  }

  async exists(options: ExistsUserOptions): ExistsUserReturn {
    return (await this.txHost.tx.user.count(options)) > 0
  }
}
