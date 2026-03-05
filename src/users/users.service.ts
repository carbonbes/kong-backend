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
import { EventEmitter2 } from '@nestjs/event-emitter'
import { USER_CREATED } from '@/events/user-created/consts'
import { UserCreatedEvent } from '@/events/user-created/user-created.event'

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(data: CreateOptions): CreateReturn {
    const user = await this.prismaService.user.create({ data })

    this.eventEmitter.emit(USER_CREATED, user as UserCreatedEvent)

    return user
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
