import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { OtpsService } from '@/otps/otps.service'
import { mock, MockProxy } from 'vitest-mock-extended'
import { EntityId, Repository } from 'redis-om'
import { Otp } from '@/otps/otps.types'
import { getRepositoryToken } from '@/shared/redis/redis.utils'
import { otpSchema } from '@/otps/otps.schema'
import { NanoidService } from '@/shared/nanoid/nanoid.service'
import { BcryptService } from '@/shared/bcrypt/bcrypt.service'
import { ConfigService } from '@nestjs/config'
import { createFakeBcryptHash, createFakeOtp } from '@/test/utils'
import { HashOptions as BcryptServiceHashOptions } from '@/shared/bcrypt/bcrypt.types'
import { UuidService } from '@/shared/uuid/uuid.service'

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
          provide: getRepositoryToken(otpSchema),
          useValue: mock<Repository<Otp>>(),
        },
      ],
    })
      .useMocker(mock)
      .compile()

    otpsService = module.get(OtpsService)
    repository = module.get(getRepositoryToken(otpSchema))
    uuidService = module.get(UuidService)
    nanoidService = module.get(NanoidService)
    bcryptService = module.get(BcryptService)
    configService = module.get(ConfigService)
    otp = createFakeOtp()
  })

  describe('create', () => {
    test('should be create OTP', async () => {
      vi.useFakeTimers()

      const { id, code, type, userId } = otp
      const codeHash = await createFakeBcryptHash({ value: code })
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
    test('should be verify OTP', async () => {
      const { id, code, type, userId } = otp
    })
  })
})
