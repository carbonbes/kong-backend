import { Test, TestingModule } from '@nestjs/testing'
import { OtpsService } from '@/otps/otps.service'
import { mock, MockProxy } from 'vitest-mock-extended'
import { EntityId, Repository } from 'redis-om'
import { Otp } from '@/otps/types'
import { getRedisOmRepositoryToken } from '@/redis-om/utils'
import { otpSchema } from '@/otps/schemas'
import { NanoidService } from '@/shared/nanoid/nanoid.service'
import { BcryptService } from '@/shared/bcrypt/bcrypt.service'
import { ConfigService } from '@nestjs/config'
import { getFakeBcryptHash, getFakeOtp } from '@/test/utils'
import {
  HashOptions as BcryptServiceHashOptions,
  CompareOptions as BcryptServiceCompareOptions,
} from '@/shared/bcrypt/types'
import { UuidService } from '@/shared/uuid/uuid.service'
import { createMockRedisSearch } from '@/test/mocks'

describe('OtpsService', () => {
  let otpsService: OtpsService
  let repository: MockProxy<Repository<Otp>>
  let uuidService: MockProxy<UuidService>
  let nanoidService: MockProxy<NanoidService>
  let bcryptService: MockProxy<BcryptService>
  let configService: MockProxy<ConfigService>
  let otp: Otp

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpsService,
        {
          provide: getRedisOmRepositoryToken(otpSchema),
          useValue: mock<Repository<Otp>>(),
        },
      ],
    })
      .useMocker(mock)
      .compile()

    otpsService = module.get(OtpsService)
    repository = module.get(getRedisOmRepositoryToken(otpSchema))
    uuidService = module.get(UuidService)
    nanoidService = module.get(NanoidService)
    bcryptService = module.get(BcryptService)
    configService = module.get(ConfigService)
    otp = getFakeOtp()

    vi.clearAllMocks()
  })

  describe('create', () => {
    test('should be create OTP', async () => {
      vi.useFakeTimers()

      const { id, code, type, userId } = otp
      const codeHash = await getFakeBcryptHash({ value: code })
      const entityId: string = otp[EntityId]
      const expiresIn = 300
      const expiresAt = new Date(Date.now() + expiresIn * 1000)

      uuidService.generate.mockReturnValue(id)
      nanoidService.customAlphabet.mockReturnValue(code)
      bcryptService.hash.mockResolvedValue(codeHash)
      repository.save.mockResolvedValue(otp)
      configService.get.mockReturnValue(expiresIn)

      const bcryptServiceHashOptions: BcryptServiceHashOptions = { value: code }
      const repositorySaveOptions: Otp = { id, code: codeHash, type, userId }

      const result = await otpsService.create({ type, userId })

      expect(result).toEqual(otp)
      expect(nanoidService.customAlphabet).toHaveBeenCalled()
      expect(bcryptService.hash).toHaveBeenCalledWith(bcryptServiceHashOptions)
      expect(repository.save).toHaveBeenCalledWith(repositorySaveOptions)
      expect(configService.get).toHaveBeenCalledWith('otp.expiresIn')
      expect(repository.expireAt).toHaveBeenCalledWith(entityId, expiresAt)

      vi.useRealTimers()
    })
  })

  describe('verify', () => {
    test('should be verify OTP and return true', async () => {
      const { id, code, type, userId } = otp
      const codeHash = await getFakeBcryptHash({ value: code })
      const entityId: string = otp[EntityId]
      const storedOtp: Otp = { ...otp, code: codeHash }

      const searchBuilder = createMockRedisSearch<Otp>({
        returnFirstValue: storedOtp,
      })
      repository.search.mockReturnValue(searchBuilder)
      bcryptService.compare.mockResolvedValue(true)

      const result = await otpsService.verify({ id, code, type, userId })

      const bcryptServiceCompareOptions: BcryptServiceCompareOptions = {
        value: code,
        encoded: codeHash,
      }

      expect(result).toBe(true)
      expect(repository.search).toHaveBeenCalled()
      expect(searchBuilder.where).toHaveBeenCalledWith('id')
      expect(searchBuilder.eq).toHaveBeenCalledWith(id)
      expect(searchBuilder.and).toHaveBeenCalledWith('type')
      expect(searchBuilder.eq).toHaveBeenCalledWith(type)
      expect(searchBuilder.and).toHaveBeenCalledWith('userId')
      expect(searchBuilder.eq).toHaveBeenCalledWith(userId)
      expect(bcryptService.compare).toHaveBeenCalledWith(
        bcryptServiceCompareOptions,
      )
      expect(repository.remove).toHaveBeenCalledWith(entityId)
    })

    test('should be return false when OTP not found', async () => {
      const { id, code, type, userId } = otp

      const searchBuilder = createMockRedisSearch<Otp>({
        returnFirstValue: null,
      })
      repository.search.mockReturnValue(searchBuilder)

      const result = await otpsService.verify({ id, code, type, userId })

      expect(result).toBe(false)
      expect(bcryptService.compare).not.toHaveBeenCalled()
      expect(repository.remove).not.toHaveBeenCalled()
    })

    test('should be return false when code does not match', async () => {
      const { id, code, type, userId } = otp
      const codeHash = await getFakeBcryptHash({ value: code })
      const storedOtp: Otp = { ...otp, code: codeHash }

      const searchBuilder = createMockRedisSearch<Otp>({
        returnFirstValue: storedOtp,
      })
      repository.search.mockReturnValue(searchBuilder)
      bcryptService.compare.mockResolvedValue(false)

      const result = await otpsService.verify({ id, code, type, userId })

      const bcryptServiceCompareOptions: BcryptServiceCompareOptions = {
        value: code,
        encoded: codeHash,
      }

      expect(result).toBe(false)
      expect(bcryptService.compare).toHaveBeenCalledWith(
        bcryptServiceCompareOptions,
      )
      expect(repository.remove).not.toHaveBeenCalled()
    })
  })
})
