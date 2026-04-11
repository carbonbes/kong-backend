import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import {
  CreateUserOptions,
  FindUniqueUserOptions,
  ExistsUserOptions,
  UpdateUserOptions,
  FindManyUsersOptions,
} from '@/users/types'
import { getFakeEmail, getFakeUser } from '@/test/utils'
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended'
import { PrismaClient } from '@/prisma/types'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'

describe('UsersService', () => {
  let usersService: UsersService
  let txHost: DeepMockProxy<
    TransactionHost<TransactionalAdapterPrisma<PrismaClient>>
  >

  beforeEach(async () => {
    txHost =
      mockDeep<TransactionHost<TransactionalAdapterPrisma<PrismaClient>>>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: TransactionHost, useValue: txHost }],
    }).compile()

    usersService = module.get<UsersService>(UsersService)
  })

  describe('create', () => {
    test('should create user', async () => {
      const { email, name, gender } = getFakeUser()
      const options: CreateUserOptions = { data: { email, name, gender } }
      const user = getFakeUser()

      txHost.tx.user.create.mockResolvedValue(user)

      const result = await usersService.create(options)

      expect(txHost.tx.user.create).toHaveBeenCalledWith(options)
      expect(result).toEqual(user)
    })
  })

  describe('findUnique', () => {
    test('should find user', async () => {
      const options: FindUniqueUserOptions = {
        where: { email: getFakeEmail() },
      }
      const user = getFakeUser()

      txHost.tx.user.findUnique.mockResolvedValue(user)

      const result = await usersService.findUnique(options)

      expect(txHost.tx.user.findUnique).toHaveBeenCalledWith(options)
      expect(result).toEqual(user)
    })

    test('should find null', async () => {
      const options: FindUniqueUserOptions = {
        where: { email: getFakeEmail() },
      }

      txHost.tx.user.findUnique.mockResolvedValue(null)

      const result = await usersService.findUnique(options)

      expect(txHost.tx.user.findUnique).toHaveBeenCalledWith(options)
      expect(result).toBeNull()
    })
  })

  describe('findMany', () => {
    test('should find users', async () => {
      const users = Array.from({ length: 10 }).map(() => getFakeUser())
      const options: FindManyUsersOptions = {
        where: { email: getFakeEmail() },
      }

      txHost.tx.user.findMany.mockResolvedValue(users)

      const result = await usersService.findMany(options)

      expect(txHost.tx.user.findMany).toHaveBeenCalledWith(options)
      expect(result).toEqual(users)
    })

    test('should find empty', async () => {
      const options: FindManyUsersOptions = {
        where: { email: getFakeEmail() },
      }

      txHost.tx.user.findMany.mockResolvedValue([])

      const result = await usersService.findMany(options)

      expect(txHost.tx.user.findMany).toHaveBeenCalledWith(options)
      expect(result).toEqual([])
    })
  })

  describe('update', () => {
    test('should update user', async () => {
      const { email, name } = getFakeUser()
      const options: UpdateUserOptions = { where: { email }, data: { name } }
      const user = getFakeUser()

      txHost.tx.user.update.mockResolvedValue(user)

      const result = await usersService.update(options)

      expect(txHost.tx.user.update).toHaveBeenCalledWith(options)
      expect(result).toEqual(user)
    })
  })

  describe('exists', () => {
    test('should return true', async () => {
      const options: ExistsUserOptions = { where: { email: getFakeEmail() } }

      txHost.tx.user.count.mockResolvedValue(1)

      const result = await usersService.exists(options)

      expect(txHost.tx.user.count).toHaveBeenCalledWith(options)
      expect(result).toBeTruthy()
    })

    test('should return false', async () => {
      const options: ExistsUserOptions = { where: { email: getFakeEmail() } }

      txHost.tx.user.count.mockResolvedValue(0)

      const result = await usersService.exists(options)

      expect(txHost.tx.user.count).toHaveBeenCalledWith(options)
      expect(result).toBeFalsy()
    })
  })
})
