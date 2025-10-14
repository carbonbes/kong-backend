import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import {
  ActivateUserOptions,
  CreateUserOptions,
  FindOneUserByOptions,
} from './user.types'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(data: CreateUserOptions) {
    return this.usersRepository.save(data)
  }

  async findOneBy(data: FindOneUserByOptions) {
    return this.usersRepository.findOneBy(data)
  }

  async activate({ email }: ActivateUserOptions) {
    return this.usersRepository.update({ email }, { isActive: true })
  }
}
