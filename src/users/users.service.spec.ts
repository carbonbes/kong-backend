import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import {
  CreateOptions,
  FindOneOptions,
  IsExistOptions,
  SetActiveOptions,
  UpdateOptions,
} from '@/users/types'
import { getFakeUser } from '@/test/utils'
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

      expect(await usersService.create(options)).toEqual(user)
      expect(prismaService.user.create).toHaveBeenCalledWith({ data: options })
    })
  })

  describe('findOne', () => {
    test('should be find a one user', async () => {
      const { email } = getFakeUser()
      const options: FindOneOptions = { where: { email } }

      const user = getFakeUser()

      prismaService.user.findUnique.mockResolvedValue(user)

      expect(await usersService.findOne(options)).toEqual(user)
      expect(prismaService.user.findUnique).toHaveBeenCalledWith(options)
    })

    test('should be return a null', async () => {
      const { email } = getFakeUser()
      const options: FindOneOptions = { where: { email } }

      prismaService.user.findUnique.mockResolvedValue(null)

      expect(await usersService.findOne(options)).toBeNull()
      expect(prismaService.user.findUnique).toHaveBeenCalledWith(options)
    })
  })

  describe('update', () => {
    test('should be update a user', async () => {
      const { email, name } = getFakeUser()
      const options: UpdateOptions = { where: { email }, data: { name } }

      const user = getFakeUser()

      prismaService.user.update.mockResolvedValue(user)

      expect(await usersService.update(options)).toEqual(user)
      expect(prismaService.user.update).toHaveBeenCalledWith(options)
    })
  })

  describe('isExist', () => {
    test('should be return a true', async () => {
      const { email } = getFakeUser()
      const options: IsExistOptions = { where: { email } }

      const user = getFakeUser()

      prismaService.user.findUnique.mockResolvedValue(user)

      expect(await usersService.isExist(options)).toBeTruthy()
      expect(prismaService.user.findUnique).toHaveBeenCalledWith(options)
    })

    test('should be return false', async () => {
      const { email } = getFakeUser()
      const options: IsExistOptions = { where: { email } }

      prismaService.user.findUnique.mockResolvedValue(null)

      expect(await usersService.isExist(options)).toBeFalsy()
      expect(prismaService.user.findUnique).toHaveBeenCalledWith(options)
    })
  })

  describe('setActive', () => {
    test('should be activate user', async () => {
      const { email } = getFakeUser()
      const options: SetActiveOptions = { where: { email }, value: true }

      const user = getFakeUser()

      prismaService.user.update.mockResolvedValue(user)

      const { where, value } = options

      const usersRepositoryUpdateOptions: UpdateOptions = {
        where,
        data: { isActive: value },
      }

      expect(await usersService.setActive(options)).toEqual(user)
      expect(prismaService.user.update).toHaveBeenCalledWith(
        usersRepositoryUpdateOptions,
      )
    })
  })
})
