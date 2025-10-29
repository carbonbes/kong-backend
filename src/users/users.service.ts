import { Inject, Injectable } from '@nestjs/common'
import {
  CreateOptions,
  FindOneOptions,
  IsExistOptions,
  SetActiveOptions,
  UpdateOptions,
  User,
} from './types'
import { PrismaService } from '@/prisma/prisma.service'
import { PRISMA_SERVICE } from '@/prisma/consts'

@Injectable()
export class UsersService {
  constructor(
    @Inject(PRISMA_SERVICE) private readonly prismaService: PrismaService,
  ) {}

  create(data: CreateOptions): Promise<User> {
    return this.prismaService.user.create({ data })
  }

  findOne(opts: FindOneOptions): Promise<User> {
    return this.prismaService.user.findUnique(opts)
  }

  update(opts: UpdateOptions): Promise<User> {
    return this.prismaService.user.update(opts)
  }

  async isExist(opts: IsExistOptions): Promise<boolean> {
    return !!(await this.findOne(opts))
  }

  setActive({ where, value }: SetActiveOptions): Promise<User> {
    return this.update({ where, data: { isActive: value } })
  }
}
