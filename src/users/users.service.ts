import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Prisma, PrismaClient } from '@/prisma/types'

@Injectable()
export class UsersService {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaClient>
    >,
  ) {}

  create(options: Prisma.UserCreateArgs) {
    return this.txHost.tx.user.create(options)
  }

  findUnique(options: Prisma.UserFindUniqueArgs) {
    return this.txHost.tx.user.findUnique(options)
  }

  findMany(options: Prisma.UserFindManyArgs) {
    return this.txHost.tx.user.findMany(options)
  }

  update(options: Prisma.UserUpdateArgs) {
    return this.txHost.tx.user.update(options)
  }

  count(options: Prisma.UserCountArgs) {
    return this.txHost.tx.user.count(options)
  }
}
