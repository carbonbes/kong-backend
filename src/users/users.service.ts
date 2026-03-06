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

  create(options: CreateOptions): CreateReturn {
    return this.prismaService.user.create({ data: options })
  }

  findOne(options: FindOneOptions): FindOneReturn {
    return this.prismaService.user.findUnique(options)
  }

  update(options: UpdateOptions): UpdateReturn {
    return this.prismaService.user.update(options)
  }

  async isExist(options: IsExistOptions): IsExistReturn {
    return !!(await this.findOne(options))
  }

  setActive(options: SetActiveOptions): SetActiveReturn {
    const { where, value } = options

    return this.update({ where, data: { isActive: value } })
  }
}
