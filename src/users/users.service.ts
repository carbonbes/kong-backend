import { Injectable } from '@nestjs/common'
import {
  CreateUserOptions,
  CreateUserReturn,
  FindUniqueUserOptions,
  FindUniqueUserReturn,
  UpdateUserOptions,
  UpdateUserReturn,
} from '@/users/types'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'

@Injectable()
export class UsersService {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  create(options: CreateUserOptions): CreateUserReturn {
    return this.txHost.tx.user.create({ data: options })
  }

  findUnique(options: FindUniqueUserOptions): FindUniqueUserReturn {
    return this.txHost.tx.user.findUnique({ where: options })
  }

  update(options: UpdateUserOptions): UpdateUserReturn {
    return this.txHost.tx.user.update({ where: {}, data: {} })
  }
}
