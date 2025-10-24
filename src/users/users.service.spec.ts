import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { User } from './user.entity'
import {
  CreateUserOptions,
  FindOneUserByOptions,
  UpdateUserOptions,
} from './user.types'
import { UserGender } from './user.enum'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

describe('UsersService', () => {
  let service: UsersService
  let repository: Pick<Repository<User>, 'save' | 'findOneBy'>

  repository = {
    save: vi.fn(),
    findOneBy: vi.fn(),
  }

  const user: User = {
    id: 1,
    email: 'test@test.com',
    name: 'Test',
    gender: UserGender.MALE,
    isActive: false,
    createdAt: new Date(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repository,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    repository = module.get<Repository<User>>(getRepositoryToken(User))
  })

  test('create', async () => {
    const createOptions: CreateUserOptions = {
      email: 'test@test.com',
      name: 'Test',
      gender: UserGender.MALE,
    }

    const createdUser: User = {
      ...createOptions,
      id: 1,
      isActive: false,
      createdAt: new Date(),
    }

    const save = vi
      .spyOn(repository, 'save')
      .mockImplementation(async () => createdUser)

    const result = await service.create(createOptions)

    expect(save).toHaveBeenCalledWith(createOptions)
    expect(result).toEqual(createdUser)
  })

  test('findOneBy', async () => {
    const findOneByOptions: FindOneUserByOptions = { id: 1 }

    const findOneBy = vi
      .spyOn(repository, 'findOneBy')
      .mockImplementation(async () => user)

    const result = await service.findOneBy(findOneByOptions)

    expect(findOneBy).toHaveBeenCalledWith(findOneByOptions)
    expect(result).toEqual(user)
  })

  test('update', async () => {
    const updateOptions: UpdateUserOptions = {
      where: { email: 'test@test.com' },
      data: {
        isActive: true,
      },
    }

    const updatedUser: User = {
      ...user,
      isActive: true,
    }

    const save = vi
      .spyOn(repository, 'save')
      .mockImplementation(async () => updatedUser)

    const result = await service.update(updateOptions)

    expect(save).toHaveBeenCalledWith(updatedUser)
    expect(result).toEqual(updatedUser)
  })
})
