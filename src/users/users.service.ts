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
import { PrismaClient } from '@/prisma/prisma.types'

@Injectable()
export class UsersService {
  constructor(
    @InjectPrismaEntity('user') private readonly users: PrismaClient['user'],
  ) {}

  create(data: CreateOptions): Promise<User> {
    return this.users.create({ data })
  }

  findOne(opts: FindOneOptions): Promise<User | null> {
    return this.users.findUnique(opts)
  }

  update(opts: UpdateOptions): Promise<User> {
    return this.users.update(opts)
  }

  async isExist(opts: IsExistOptions): Promise<boolean> {
    return !!(await this.findOne(opts))
  }

  setActive({ where, value }: SetActiveOptions): Promise<User> {
    return this.update({ where, data: { isActive: value } })
  }
}
