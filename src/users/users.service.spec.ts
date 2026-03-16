import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import {
  CreateOptions,
  FindOneOptions,
  IsExistOptions,
  SetActiveOptions,
  UpdateOptions,
} from '@/users/types'
import { getFakeEmail, getFakeUser } from '@/test/utils'
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended'
import { PrismaClient } from '@/prisma/client'
import { PRISMA_CLIENT } from '@/prisma/consts'

describe('UsersService', () => {
  let usersService: UsersService
  let prismaClient: DeepMockProxy<PrismaClient>

  beforeEach(async () => {
    prismaClient = mockDeep<PrismaClient>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PRISMA_CLIENT, useValue: prismaClient },
      ],
    }).compile()

    usersService = module.get<UsersService>(UsersService)
    prismaClient = module.get<DeepMockProxy<PrismaClient>>(PRISMA_CLIENT)
  })

  describe('create', () => {
    test('should be create a user', async () => {
      const { email, name, gender } = getFakeUser()
      const options: CreateOptions = { email, name, gender }
      const user = getFakeUser()

      prismaClient.user.create.mockResolvedValue(user)

      const result = await usersService.create(options)

      expect(result).toEqual(user)
      expect(prismaClient.user.create).toHaveBeenCalledWith({ data: options })
    })
  })

  describe('findOne', () => {
    test('should be find a one user', async () => {
      const options: FindOneOptions = { where: { email: getFakeEmail() } }
      const user = getFakeUser()

      prismaClient.user.findUnique.mockResolvedValue(user)

      const result = await usersService.findOne(options)

      expect(result).toEqual(user)
      expect(prismaClient.user.findUnique).toHaveBeenCalledWith(options)
    })

    test('should be return a null', async () => {
      const options: FindOneOptions = { where: { email: getFakeEmail() } }

      prismaClient.user.findUnique.mockResolvedValue(null)

      const result = await usersService.findOne(options)

      expect(result).toBeNull()
      expect(prismaClient.user.findUnique).toHaveBeenCalledWith(options)
    })
  })

  describe('update', () => {
    test('should be update a user', async () => {
      const { email, name } = getFakeUser()
      const options: UpdateOptions = { where: { email }, data: { name } }
      const user = getFakeUser()

      prismaClient.user.update.mockResolvedValue(user)

      const result = await usersService.update(options)

      expect(result).toEqual(user)
      expect(prismaClient.user.update).toHaveBeenCalledWith(options)
    })
  })

  describe('isExist', () => {
    test('should be return a true', async () => {
      const options: IsExistOptions = { where: { email: getFakeEmail() } }
      const user = getFakeUser()

      prismaClient.user.findUnique.mockResolvedValue(user)

      const result = await usersService.isExist(options)

      expect(result).toBeTruthy()
      expect(prismaClient.user.findUnique).toHaveBeenCalledWith(options)
    })

    test('should be return false', async () => {
      const options: IsExistOptions = { where: { email: getFakeEmail() } }

      prismaClient.user.findUnique.mockResolvedValue(null)

      const result = await usersService.isExist(options)

      expect(result).toBeFalsy()
      expect(prismaClient.user.findUnique).toHaveBeenCalledWith(options)
    })
  })

  describe('setActive', () => {
    test('should be activate user', async () => {
      const options: SetActiveOptions = {
        where: { email: getFakeEmail() },
        value: true,
      }
      const user = getFakeUser()

      prismaClient.user.update.mockResolvedValue(user)

      const result = await usersService.setActive(options)

      const { where, value } = options

      expect(result).toEqual(user)
      expect(prismaClient.user.update).toHaveBeenCalledWith({
        where,
        data: { isActive: value },
      })
    })
  })
})
