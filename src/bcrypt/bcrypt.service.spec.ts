import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import * as bcrypt from 'bcrypt'
import { mock, MockProxy } from 'vitest-mock-extended'
import { BcryptService } from './bcrypt.service'
import { BcryptModuleOptions, HashOptions } from './types'
import { MODULE_OPTIONS_TOKEN } from '@/bcrypt/bcrypt.module-definition'

vi.mock('bcrypt', { spy: true })

describe('BcryptService', () => {
  let bcryptService: BcryptService
  let options: MockProxy<BcryptModuleOptions>

  beforeEach(async () => {
    options = mock<BcryptModuleOptions>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BcryptService,
        { provide: MODULE_OPTIONS_TOKEN, useValue: options },
      ],
    }).compile()

    bcryptService = module.get<BcryptService>(BcryptService)
  })

  describe('hash', () => {
    test('should be hash a value', async () => {
      const hashOptions: HashOptions = { value: 'password' }
      const expectedHash = 'mocked-hash-value'

      vi.mocked(bcrypt.hash).mockImplementation(() => expectedHash)

      const result = await bcryptService.hash(hashOptions)

      expect(result).toBe(expectedHash)
      expect(bcrypt.hash).toHaveBeenCalledWith(
        hashOptions.value,
        options.rounds,
      )
    })
  })

  describe('compare', () => {
    test('should be return true when values match', async () => {
      const value = 'password123'
      const hashed = 'hashedPassword123'

      vi.mocked(bcrypt.compare).mockImplementation(() => true)

      const result = await bcryptService.compare({ value, hash: hashed })

      expect(result).toBe(true)
      expect(bcrypt.compare).toHaveBeenCalledWith(value, hashed)
    })

    test('should be return false when values do not match', async () => {
      const value = 'wrongPassword'
      const hashed = 'hashedPassword123'

      vi.mocked(bcrypt.compare).mockImplementation(() => false)

      const result = await bcryptService.compare({ value, hash: hashed })

      expect(result).toBe(false)
      expect(bcrypt.compare).toHaveBeenCalledWith(value, hashed)
    })
  })
})
