import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { PrismaClient } from '@/prisma/types'
import { UserDelegate } from '@/users/types'
import { PrismaModelService } from '@/prisma/prisma-model.service'

@Injectable()
export class UsersService extends PrismaModelService<UserDelegate> {
  constructor(
    readonly txHost: TransactionHost<TransactionalAdapterPrisma<PrismaClient>>,
  ) {
    super(txHost, 'user')
  }
}
