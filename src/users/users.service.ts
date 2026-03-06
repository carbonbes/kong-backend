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
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: CreateOptions): CreateReturn {
    return this.prismaService.user.create({ data })
  }

  findOne(opts: FindOneOptions): FindOneReturn {
    return this.prismaService.user.findUnique(opts)
  }

  update(opts: UpdateOptions): UpdateReturn {
    return this.prismaService.user.update(opts)
  }

  async isExist(opts: IsExistOptions): IsExistReturn {
    return !!(await this.findOne(opts))
  }

  setActive({ where, value }: SetActiveOptions): SetActiveReturn {
    return this.update({ where, data: { isActive: value } })
  }
}
