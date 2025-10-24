import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { OtpsService } from './otps.service'
import { Repository } from 'typeorm'
import { Otp } from './otp.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { CreateOtpOptions } from './otp.types'
import { OtpType } from './otp.enum'
import { User } from '../users/user.entity'
import { UserGender } from '../users/user.enum'

describe('OtpsService', () => {
  let service: OtpsService
  let repository: Pick<Repository<Otp>, 'save' | 'findOneBy' | 'delete'>

  repository = {
    save: vi.fn(),
    findOneBy: vi.fn(),
    delete: vi.fn(),
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
        OtpsService,
        {
          provide: getRepositoryToken(Otp),
          useValue: repository,
        },
      ],
    }).compile()

    service = module.get<OtpsService>(OtpsService)
    repository = module.get<Repository<Otp>>(getRepositoryToken(Otp))
  })

  test('create', async () => {
    const createOptions: CreateOtpOptions = {
      otp: '123456',
      type: OtpType.SIGN_IN,
      user,
      expiresAt: new Date(Date.now() + 300 * 1000),
    }

    const createdOtp: Otp = {
      ...createOptions,
      id: 1,
      createdAt: new Date(),
    }

    const save = vi
      .spyOn(repository, 'save')
      .mockImplementation(async () => createdOtp)

    const result = await service.create(createOptions)

    expect(save).toHaveBeenCalledWith(createOptions)
    expect(result).toEqual(createdOtp)
  })
})
