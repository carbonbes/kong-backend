import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { BaseService } from '../shared/base.service'
import { UserResponseDto } from './user.dto'
import { ClassConstructor } from 'class-transformer'

@Injectable()
export class UsersService extends BaseService<User, UserResponseDto> {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly userResponseDto: ClassConstructor<UserResponseDto>,
  ) {
    super(usersRepository, userResponseDto)
  }
}
