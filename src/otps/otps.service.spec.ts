import { Test, TestingModule } from '@nestjs/testing'
import { OtpsService } from '@/otps/otps.service'
import { mock, MockProxy } from 'vitest-mock-extended'
import { EntityId, Repository } from 'redis-om'
import { CreateOptions, OtpSchema, VerifyOptions } from '@/otps/types'
import { getRedisOmRepositoryToken } from '@/redis-om/utils'
import { otpSchema } from '@/otps/schemas'
import { NanoidService } from '@/nanoid/nanoid.service'
import { ConfigService } from '@nestjs/config'
import { getFakeOtp } from '@/test/utils'
import { createMockRedisSearch } from '@/test/mocks'
import { HashService } from '@/hash/hash.service'
import { OtpType } from '@/otps/enums'

describe('OtpsService', () => {
  let otpsService: OtpsService
  let repository: MockProxy<Repository<OtpSchema>>
  let nanoidService: MockProxy<NanoidService>
  let hashService: MockProxy<HashService>
  let configService: MockProxy<ConfigService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpsService,
        {
          provide: getRedisOmRepositoryToken(otpSchema),
          useValue: mock<Repository<OtpSchema>>(),
        },
      ],
    })
      .useMocker(mock)
      .compile()

    otpsService = module.get<OtpsService>(OtpsService)
    repository = module.get<MockProxy<Repository<OtpSchema>>>(
      getRedisOmRepositoryToken(otpSchema),
    )
    nanoidService = module.get<MockProxy<NanoidService>>(NanoidService)
    hashService = module.get<MockProxy<HashService>>(HashService)
    configService = module.get<MockProxy<ConfigService>>(ConfigService)

    vi.clearAllMocks()
  })

  describe('create', () => {
    test('should be create OTP', async () => {
      vi.useFakeTimers()

      const { type, email } = getFakeOtp()
      const options: CreateOptions = { type, email }

      const otp = getFakeOtp() as OtpSchema
      const code = otp.code
      const hashedCode = 'hash'
      const entityId = otp[EntityId]!
      const expiresIn = 300
      const expiresAt = new Date(Date.now() + expiresIn * 1000)

      nanoidService.customAlphabet.mockReturnValue(code)
      hashService.generate.mockReturnValue(hashedCode)
      repository.save.mockResolvedValue(otp)
      configService.get.mockReturnValue(expiresIn)

      const result = await otpsService.create(options)

      expect(result).toEqual(otp)
      expect(nanoidService.customAlphabet).toHaveBeenCalled()
      expect(hashService.generate).toHaveBeenCalledWith({ value: code })
      expect(repository.save).toHaveBeenCalledWith({
        code: hashedCode,
        type,
        email,
      })
      expect(configService.get).toHaveBeenCalledWith('otp.expiresIn')
      expect(repository.expireAt).toHaveBeenCalledWith(entityId, expiresAt)

      vi.useRealTimers()
    })
  })

  describe('verify', () => {
    test('should be verify OTP and return true', async () => {
      const { code, type, email } = getFakeOtp()
      const options: VerifyOptions = { code, type, email }

      const otp = getFakeOtp() as OtpSchema
      const hashedCode = 'hash'
      const entityId = otp[EntityId]!
      const storedOtp: OtpSchema = { code: hashedCode, type, email }

      const searchBuilder = createMockRedisSearch<OtpSchema>({
        returnFirstValue: storedOtp,
      })

      hashService.generate.mockReturnValue(hashedCode)
      repository.search.mockReturnValue(searchBuilder)

      const result = await otpsService.verify(options)

      expect(result).toBe(true)
      expect(hashService.generate).toHaveBeenCalledWith({ value: options.code })
      expect(repository.search).toHaveBeenCalled()
      expect(searchBuilder.where).toHaveBeenCalledWith('code')
      expect(searchBuilder.eq).toHaveBeenCalledWith(hashedCode)
      expect(searchBuilder.returnFirst).toHaveBeenCalled()
      expect(repository.remove).toHaveBeenCalledWith(entityId)
    })

    test('should be return false when OTP not found', async () => {
      const { code, type, email } = getFakeOtp()
      const options: VerifyOptions = { code, type, email }

      const hashedCode = 'hash'

      const searchBuilder = createMockRedisSearch<OtpSchema>({
        returnFirstValue: null,
      })

      hashService.generate.mockReturnValue(hashedCode)
      repository.search.mockReturnValue(searchBuilder)

      const result = await otpsService.verify(options)

      expect(result).toBe(false)
      expect(hashService.generate).toHaveBeenCalledWith({ value: options.code })
      expect(repository.search).toHaveBeenCalled()
      expect(searchBuilder.where).toHaveBeenCalledWith('code')
      expect(searchBuilder.eq).toHaveBeenCalledWith(hashedCode)
      expect(searchBuilder.returnFirst).toHaveBeenCalled()
      expect(repository.remove).not.toHaveBeenCalled()
    })

    test('should be return false if the code exists but does not match the email or type', async () => {
      const { code, type, email } = getFakeOtp({ type: OtpType.SIGN_UP })
      const options: VerifyOptions = { code, type, email }

      const hashedCode = 'hash'
      const storedOtp = getFakeOtp({
        code,
        type: OtpType.SIGN_IN,
        email,
      }) as OtpSchema

      const searchBuilder = createMockRedisSearch<OtpSchema>({
        returnFirstValue: storedOtp,
      })

      hashService.generate.mockReturnValue(hashedCode)
      repository.search.mockReturnValue(searchBuilder)

      const result = await otpsService.verify(options)

      expect(result).toBe(false)
      expect(hashService.generate).toHaveBeenCalledWith({ value: options.code })
      expect(repository.search).toHaveBeenCalled()
      expect(searchBuilder.where).toHaveBeenCalledWith('code')
      expect(searchBuilder.eq).toHaveBeenCalledWith(hashedCode)
      expect(searchBuilder.returnFirst).toHaveBeenCalled()
      expect(repository.remove).not.toHaveBeenCalled()
    })
  })
})
