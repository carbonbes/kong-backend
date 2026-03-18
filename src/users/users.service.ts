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
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@/users/entities'
import { Repository } from 'typeorm'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  create(options: CreateOptions): CreateReturn {
    return this.usersRepository.save(options)
  }

  findOne(options: FindOneOptions): FindOneReturn {
    return this.usersRepository.findOneBy(options)
  }

  async update(options: UpdateOptions): UpdateReturn {
    const { where, data } = options

    await this.usersRepository.update(where, data)

    return (await this.findOne(where))!
  }

  async isExist(options: IsExistOptions): IsExistReturn {
    return !!(await this.findOne(options))
  }

  setActive(options: SetActiveOptions): SetActiveReturn {
    return this.update(options)
  }
}
