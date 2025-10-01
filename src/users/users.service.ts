import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entity'
import {
  ActivateUserInput,
  CreateUserInput,
  FindOneByUserInput,
} from './interface'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(data: CreateUserInput) {
    return this.usersRepository.save(data)
  }

  async findOneBy(data: FindOneByUserInput) {
    return this.usersRepository.findOneBy(data)
  }

  async activate({ email }: ActivateUserInput) {
    return this.usersRepository.update(email, { isActive: true })
  }
}
