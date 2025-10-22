import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { OtpsService } from './otps.service'
import { MockRepository } from '../shared/types/tests.type'
import { Repository } from 'typeorm'
import { Otp } from './otp.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { CreateOtpOptions } from './otp.types'
import { OtpType } from './otp.enum'
import { User } from '../users/user.entity'
import { UserGender } from '../users/user.enum'

describe('OtpsService', () => {
  let service: OtpsService
  let mockRepository: MockRepository<
    Pick<Repository<Otp>, 'save' | 'findOneBy' | 'delete'>
  >

  mockRepository = {
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
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<OtpsService>(OtpsService)
    mockRepository = module.get(getRepositoryToken(Otp))
  })

  test('create', async () => {
    const createOptions: CreateOtpOptions = {
      type: OtpType.SIGN_IN,
      user,
    }

    const createdOtp: Otp = {
      ...createOptions,
      id: 1,
      otp: '123456',
      createdAt: new Date(),
      expiresAt: new Date(),
    }

    mockRepository.save.mockResolvedValue(createdOtp)

    const result = await service.create(createOptions)
    expect(result).toEqual(createdOtp)
  })

  test('verify', async () => {})
})
