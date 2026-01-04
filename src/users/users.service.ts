import { Injectable } from '@nestjs/common'
import {
  CreateOptions,
  FindOneOptions,
  IsExistOptions,
  SetActiveOptions,
  UpdateOptions,
  User,
} from './users.types'
import { InjectPrismaEntity } from '@/prisma/prisma.utils'
import { PrismaClient } from '@/generated/prisma/client'

@Injectable()
export class UsersService {
  constructor(
    @InjectPrismaEntity('user') private readonly user: PrismaClient['user'],
  ) {}

  create(data: CreateOptions): Promise<User> {
    return this.user.create({ data })
  }

  findOne(opts: FindOneOptions): Promise<User | null> {
    return this.user.findUnique(opts)
  }

  update(opts: UpdateOptions): Promise<User> {
    return this.user.update(opts)
  }

  async isExist(opts: IsExistOptions): Promise<boolean> {
    return !!(await this.findOne(opts))
  }

  setActive({ where, value }: SetActiveOptions): Promise<User> {
    return this.update({ where, data: { isActive: value } })
  }
}
