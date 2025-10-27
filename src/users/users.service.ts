import { Inject, Injectable } from '@nestjs/common'
import {
  CreateOptions,
  FindOneOptions,
  IsExistOptions,
  UpdateOptions,
} from './types'
import { PrismaService } from '@/prisma/prisma.service'
import { PRISMA_SERVICE } from '@/prisma/consts'

@Injectable()
export class UsersService {
  constructor(
    @Inject(PRISMA_SERVICE) private readonly prismaService: PrismaService,
  ) {}

  create(data: CreateOptions) {
    return this.prismaService.user.create({ data })
  }

  findOne(opts: FindOneOptions) {
    return this.prismaService.user.findUnique(opts)
  }

  update(opts: UpdateOptions) {
    return this.prismaService.user.update(opts)
  }

  async isExist(opts: IsExistOptions) {
    return !!this.prismaService.user.count(opts)
  }
}
