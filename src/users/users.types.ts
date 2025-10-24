import { CreateUserDto } from './users.dto'
import { FindOptionsWhere } from 'typeorm'
import { User } from './users.entity'

type FindUserOptions = FindOptionsWhere<User>

export type CreateUserOptions = CreateUserDto
export type CreateUserReturn = Promise<User>
export type FindOneUserByOptions = FindUserOptions
export type FindOneUserByReturn = Promise<User>
export type UpdateUserOptions = {
  where: FindUserOptions
  data: Partial<Pick<User, 'email' | 'name' | 'gender' | 'isActive'>>
}
export type UpdateUserReturn = Promise<User>
