import { beforeEach, describe, expect, test } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { createMock, DeepMocked } from '@golevelup/ts-vitest'
import { PrismaClient } from '@/prisma/prisma.types'
import { getPrismaEntityToken } from '@/prisma/prisma.utils'
import { CreateOptions } from '@/users/users.types'
import { createFakeUser } from '@/test/utils'

describe('UsersService', () => {
  let usersService: UsersService
  let users: DeepMocked<PrismaClient['user']>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    })
      .useMocker(createMock)
      .compile()

    usersService = module.get(UsersService)
    users = module.get(getPrismaEntityToken('user'))
  })

  describe('create', () => {
    test('should be create a user', async () => {
      const { email, name, gender } = createFakeUser()
      const data: CreateOptions = { email, name, gender }

      const user = createFakeUser({ ...data })

      users.create.mockResolvedValue(user)

      expect(await usersService.create(data)).toBe(user)
      expect(users.create).toHaveBeenCalledWith({ data })
    })
  })
})
