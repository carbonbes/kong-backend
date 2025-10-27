import { Inject, Injectable } from '@nestjs/common'
import {
  CreateUserOptions,
  FindOneUserOptions,
  UpdateUserOptions,
} from './types'
import { PrismaService } from '@/prisma/prisma.service'
import { PRISMA_SERVICE } from '@/prisma/consts'

@Injectable()
export class UsersService {
  constructor(
    @Inject(PRISMA_SERVICE) private readonly prismaService: PrismaService,
  ) {}

  create(data: CreateUserOptions) {
    return this.prismaService.user.create({ data })
  }

  findOne(opts: FindOneUserOptions) {
    return this.prismaService.user.findUnique(opts)
  }

  update(opts: UpdateUserOptions) {
    return this.prismaService.user.update(opts)
  }
}
