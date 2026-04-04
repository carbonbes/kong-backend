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
import { mock, MockProxy } from 'vitest-mock-extended'
import { Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from '@/users/entities'

describe('UsersService', () => {
  let usersService: UsersService
  let usersRepository: MockProxy<Repository<User>>

  beforeEach(async () => {
    usersRepository = mock<Repository<User>>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
      ],
    }).compile()

    usersService = module.get<UsersService>(UsersService)
  })

  describe('create', () => {
    test('should create a user', async () => {
      const { email, name, gender } = getFakeUser()
      const options: CreateOptions = { email, name, gender }
      const user = getFakeUser()

      usersRepository.save.mockResolvedValue(user)

      const result = await usersService.create(options)

      expect(usersRepository.save).toHaveBeenCalledWith(options)
      expect(result).toEqual(user)
    })
  })

  describe('findOne', () => {
    test('should find a one user', async () => {
      const options: FindOneOptions = { email: getFakeEmail() }
      const user = getFakeUser()

      usersRepository.findOneBy.mockResolvedValue(user)

      const result = await usersService.findOne(options)

      expect(usersRepository.findOneBy).toHaveBeenCalledWith(options)
      expect(result).toEqual(user)
    })

    test('should return a null', async () => {
      const options: FindOneOptions = { email: getFakeEmail() }

      usersRepository.findOneBy.mockResolvedValue(null)

      const result = await usersService.findOne(options)

      expect(usersRepository.findOneBy).toHaveBeenCalledWith(options)
      expect(result).toBeNull()
    })
  })

  describe('update', () => {
    test('should update a user', async () => {
      const { email, name } = getFakeUser()
      const options: UpdateOptions = { where: { email }, data: { name } }
      const user = getFakeUser()

      usersRepository.findOneBy.mockResolvedValue(user)

      const result = await usersService.update(options)

      expect(usersRepository.update).toHaveBeenCalledWith(
        options.where,
        options.data,
      )
      expect(usersRepository.findOneBy).toHaveBeenCalledWith(options.where)
      expect(result).toEqual(user)
    })
  })

  describe('isExist', () => {
    test('should return a true', async () => {
      const options: IsExistOptions = { email: getFakeEmail() }
      const user = getFakeUser()

      usersRepository.findOneBy.mockResolvedValue(user)

      const result = await usersService.isExist(options)

      expect(usersRepository.findOneBy).toHaveBeenCalledWith(options)
      expect(result).toBeTruthy()
    })

    test('should return false', async () => {
      const options: IsExistOptions = { email: getFakeEmail() }

      usersRepository.findOneBy.mockResolvedValue(null)

      const result = await usersService.isExist(options)

      expect(usersRepository.findOneBy).toHaveBeenCalledWith(options)
      expect(result).toBeFalsy()
    })
  })

  describe('setActive', () => {
    test('should activate user', async () => {
      const user = getFakeUser({ isActive: false })
      const options: SetActiveOptions = {
        where: { email: user.email },
        data: { isActive: true },
      }
      const activeUser: User = { ...user, isActive: true }

      usersRepository.findOneBy.mockResolvedValue(activeUser)

      const result = await usersService.setActive(options)

      expect(usersRepository.update).toHaveBeenCalledWith(
        options.where,
        options.data,
      )
      expect(usersRepository.findOneBy).toHaveBeenCalledWith(options.where)
      expect(result).toEqual(activeUser)
    })
  })
})
