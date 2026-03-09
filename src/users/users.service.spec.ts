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
import { PrismaService } from '@/prisma/prisma.service'

describe('UsersService', () => {
  let usersService: UsersService
  let prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    })
      .useMocker(mockDeep)
      .compile()

    usersService = module.get<UsersService>(UsersService)
    prismaService = module.get<DeepMockProxy<PrismaService>>(PrismaService)
  })

  describe('create', () => {
    test('should be create a user', async () => {
      const { email, name, gender } = getFakeUser()
      const options: CreateOptions = { email, name, gender }
      const user = getFakeUser()

      prismaService.user.create.mockResolvedValue(user)

      const result = await usersService.create(options)

      expect(result).toEqual(user)
      expect(prismaService.user.create).toHaveBeenCalledWith({ data: options })
    })
  })

  describe('findOne', () => {
    test('should be find a one user', async () => {
      const options: FindOneOptions = { where: { email: getFakeEmail() } }
      const user = getFakeUser()

      prismaService.user.findUnique.mockResolvedValue(user)

      const result = await usersService.findOne(options)

      expect(result).toEqual(user)
      expect(prismaService.user.findUnique).toHaveBeenCalledWith(options)
    })

    test('should be return a null', async () => {
      const options: FindOneOptions = { where: { email: getFakeEmail() } }

      prismaService.user.findUnique.mockResolvedValue(null)

      const result = await usersService.findOne(options)

      expect(result).toBeNull()
      expect(prismaService.user.findUnique).toHaveBeenCalledWith(options)
    })
  })

  describe('update', () => {
    test('should be update a user', async () => {
      const { email, name } = getFakeUser()
      const options: UpdateOptions = { where: { email }, data: { name } }
      const user = getFakeUser()

      prismaService.user.update.mockResolvedValue(user)

      const result = await usersService.update(options)

      expect(result).toEqual(user)
      expect(prismaService.user.update).toHaveBeenCalledWith(options)
    })
  })

  describe('isExist', () => {
    test('should be return a true', async () => {
      const options: IsExistOptions = { where: { email: getFakeEmail() } }
      const user = getFakeUser()

      prismaService.user.findUnique.mockResolvedValue(user)

      const result = await usersService.isExist(options)

      expect(result).toBeTruthy()
      expect(prismaService.user.findUnique).toHaveBeenCalledWith(options)
    })

    test('should be return false', async () => {
      const options: IsExistOptions = { where: { email: getFakeEmail() } }

      prismaService.user.findUnique.mockResolvedValue(null)

      const result = await usersService.isExist(options)

      expect(result).toBeFalsy()
      expect(prismaService.user.findUnique).toHaveBeenCalledWith(options)
    })
  })

  describe('setActive', () => {
    test('should be activate user', async () => {
      const options: SetActiveOptions = {
        where: { email: getFakeEmail() },
        value: true,
      }
      const user = getFakeUser()

      prismaService.user.update.mockResolvedValue(user)

      const result = await usersService.setActive(options)

      const { where, value } = options

      expect(result).toEqual(user)
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where,
        data: { isActive: value },
      })
    })
  })
})
