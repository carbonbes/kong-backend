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
} from '@/users/users.types'
import { InjectPrismaEntity } from '@/shared/prisma/prisma.decorators'
import { PrismaClient } from '@/shared/prisma/prisma.types'

@Injectable()
export class UsersService {
  constructor(
    @InjectPrismaEntity('user')
    private readonly usersRepository: PrismaClient['user'],
  ) {}

  create(data: CreateOptions): CreateReturn {
    return this.usersRepository.create({ data })
  }

  findOne(opts: FindOneOptions): FindOneReturn {
    return this.usersRepository.findUnique(opts)
  }

  update(opts: UpdateOptions): UpdateReturn {
    return this.usersRepository.update(opts)
  }

  async isExist(opts: IsExistOptions): IsExistReturn {
    return !!(await this.findOne(opts))
  }

  setActive({ where, value }: SetActiveOptions): SetActiveReturn {
    return this.update({ where, data: { isActive: value } })
  }
}
