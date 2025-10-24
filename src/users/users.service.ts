import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './users.entity'
import {
  CreateUserOptions,
  CreateUserReturn,
  FindOneUserByOptions,
  FindOneUserByReturn,
  UpdateUserOptions,
  UpdateUserReturn,
} from './users.types'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  create(data: CreateUserOptions): CreateUserReturn {
    return this.usersRepository.save(data)
  }

  findOneBy(where: FindOneUserByOptions): FindOneUserByReturn {
    return this.usersRepository.findOneBy(where)
  }

  async update({ where, data }: UpdateUserOptions): UpdateUserReturn {
    const user = await this.findOneBy(where)

    return this.usersRepository.save({ ...user, ...data })
  }
}
