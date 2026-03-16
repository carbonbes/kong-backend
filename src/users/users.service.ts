import { Injectable } from '@nestjs/common'
import {
  CreateOptions,
  CreateReturn,
  FindOneOptions,
  FindOneReturn,
  IsExistOptions,
  IsExistReturn,
  SetActiveOptions,
  SetActiveReturn,
  UpdateOptions,
  UpdateReturn,
} from '@/users/types'
import { PrismaClient } from '@/prisma/client'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaClient: TransactionHost<
      TransactionalAdapterPrisma<PrismaClient>
    >,
  ) {}

  create(options: CreateOptions): CreateReturn {
    return this.prismaClient.tx.user.create({ data: options })
  }

  findOne(options: FindOneOptions): FindOneReturn {
    return this.prismaClient.tx.user.findUnique(options)
  }

  update(options: UpdateOptions): UpdateReturn {
    return this.prismaClient.tx.user.update(options)
  }

  async isExist(options: IsExistOptions): IsExistReturn {
    return !!(await this.findOne(options))
  }

  setActive(options: SetActiveOptions): SetActiveReturn {
    const { where, value } = options

    return this.update({ where, data: { isActive: value } })
  }
}
