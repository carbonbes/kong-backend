import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { User } from './user.entity'
import {
  ActivateUserOptions,
  CreateUserOptions,
  FindOneUserByOptions,
} from './user.types'
import { UserGender } from './user.enum'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MockRepository } from '../shared/types/tests.type'

describe('UsersService', () => {
  let service: UsersService
  let mockRepository: MockRepository<
    Pick<Repository<User>, 'save' | 'findOneBy' | 'update'>
  >

  mockRepository = {
    save: vi.fn(),
    findOneBy: vi.fn(),
    update: vi.fn(),
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
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    mockRepository = module.get(getRepositoryToken(User))
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

    mockRepository.save.mockResolvedValue(createdUser)

    const result = await service.create(createOptions)
    expect(result).toEqual(createdUser)
  })

  test('findOneBy', async () => {
    const findOneByOptions: FindOneUserByOptions = { id: 1 }

    mockRepository.findOneBy.mockResolvedValue(user)

    const result = await service.findOneBy(findOneByOptions)
    expect(result).toEqual(user)
  })

  test('activate', async () => {
    const activateOptions: ActivateUserOptions = { email: 'test@test.com' }

    const activatedUser = {
      ...user,
      isActive: true,
    }

    mockRepository.update.mockResolvedValue(activatedUser)

    const result = await service.activate(activateOptions)
    expect(result).toEqual(activatedUser)
  })
})
