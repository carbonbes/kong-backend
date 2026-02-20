import { beforeEach, describe, expect, test } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { PrismaClient } from '@/shared/prisma/prisma.types'
import {
  CreateOptions,
  FindOneOptions,
  IsExistOptions,
  SetActiveOptions,
  UpdateOptions,
} from '@/users/users.types'
import { getFakeUser } from '@/test/utils'
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended'
import { getPrismaEntityToken } from '@/shared/prisma/prisma.utils'

describe('UsersService', () => {
  let usersService: UsersService
  let usersRepository: DeepMockProxy<PrismaClient['user']>

  beforeEach(async () => {
    usersRepository = mockDeep<PrismaClient['user']>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getPrismaEntityToken('user'), useValue: usersRepository },
      ],
    }).compile()

    usersService = module.get(UsersService)
  })

  describe('create', () => {
    test('should be create a user', async () => {
      const { email, name, gender } = getFakeUser()
      const data: CreateOptions = { email, name, gender }

      const user = getFakeUser()

      usersRepository.create.mockResolvedValue(user)

      expect(await usersService.create(data)).toEqual(user)
      expect(usersRepository.create).toHaveBeenCalledWith({ data })
    })
  })

  describe('findOne', () => {
    test('should be find a one user', async () => {
      const { email } = getFakeUser()
      const data: FindOneOptions = { where: { email } }

      const user = getFakeUser()

      usersRepository.findUnique.mockResolvedValue(user)

      expect(await usersService.findOne(data)).toEqual(user)
      expect(usersRepository.findUnique).toHaveBeenCalledWith(data)
    })

    test('should be return a null', async () => {
      const { email } = getFakeUser()
      const data: FindOneOptions = { where: { email } }

      usersRepository.findUnique.mockResolvedValue(null)

      expect(await usersService.findOne(data)).toBeNull()
      expect(usersRepository.findUnique).toHaveBeenCalledWith(data)
    })
  })

  describe('update', () => {
    test('should be update a user', async () => {
      const { email, name } = getFakeUser()
      const data: UpdateOptions = { where: { email }, data: { name } }

      const user = getFakeUser()

      usersRepository.update.mockResolvedValue(user)

      expect(await usersService.update(data)).toEqual(user)
      expect(usersRepository.update).toHaveBeenCalledWith(data)
    })
  })

  describe('isExist', () => {
    test('should be return a true', async () => {
      const { email } = getFakeUser()
      const data: IsExistOptions = { where: { email } }

      const user = getFakeUser()

      usersRepository.findUnique.mockResolvedValue(user)

      expect(await usersService.isExist(data)).toBeTruthy()
      expect(usersRepository.findUnique).toHaveBeenCalledWith(data)
    })

    test('should be return false', async () => {
      const { email } = getFakeUser()
      const data: IsExistOptions = { where: { email } }

      usersRepository.findUnique.mockResolvedValue(null)

      expect(await usersService.isExist(data)).toBeFalsy()
      expect(usersRepository.findUnique).toHaveBeenCalledWith(data)
    })
  })

  describe('setActive', () => {
    test('should be activate user', async () => {
      const { email } = getFakeUser()
      const data: SetActiveOptions = { where: { email }, value: true }

      const user = getFakeUser()

      usersRepository.update.mockResolvedValue(user)

      const usersRepositoryUpdateOptions: UpdateOptions = {
        where: data.where,
        data: { isActive: data.value },
      }

      expect(await usersService.setActive(data)).toEqual(user)
      expect(usersRepository.update).toHaveBeenCalledWith(
        usersRepositoryUpdateOptions,
      )
    })
  })
})
