import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import {
  CreateUserOptions,
  FindOneUserByOptions,
  UpdateUserOptions,
} from './user.types'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  create(data: CreateUserOptions): Promise<User> {
    return this.usersRepository.save(data)
  }

  findOneBy(where: FindOneUserByOptions): Promise<User> {
    return this.usersRepository.findOneBy(where)
  }

  async update({ where, data }: UpdateUserOptions): Promise<User> {
    const user = await this.findOneBy(where)

    return this.usersRepository.save({ ...user, ...data })
  }
}
