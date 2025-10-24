import { CreateUserDto } from './user.dto'
import { FindOptionsWhere } from 'typeorm'
import { User } from './user.entity'

type FindUserOptions = FindOptionsWhere<User>

export type CreateUserOptions = CreateUserDto
export type FindOneUserByOptions = FindUserOptions
export type UpdateUserOptions = {
  where: FindUserOptions
  data: Partial<Pick<User, 'email' | 'name' | 'gender' | 'isActive'>>
}
