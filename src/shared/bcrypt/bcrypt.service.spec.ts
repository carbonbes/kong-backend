import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import * as bcrypt from 'bcrypt'
import { mock, MockProxy } from 'vitest-mock-extended'
import { BcryptService } from './bcrypt.service'
import { BCRYPT_MODULE_OPTIONS } from './bcrypt.consts'
import { BcryptModuleOptions, HashOptions } from './bcrypt.types'

vi.mock('bcrypt', { spy: true })

describe('BcryptService', () => {
  let bcryptService: BcryptService
  let options: MockProxy<BcryptModuleOptions>

  beforeEach(async () => {
    options = mock<BcryptModuleOptions>()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BcryptService,
        { provide: BCRYPT_MODULE_OPTIONS, useValue: options },
      ],
    }).compile()

    bcryptService = module.get(BcryptService)
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
      const encoded = 'hashedPassword123'

      vi.mocked(bcrypt.compare).mockImplementation(() => true)

      const result = await bcryptService.compare({ value, encoded })

      expect(result).toBe(true)
      expect(bcrypt.compare).toHaveBeenCalledWith(value, encoded)
    })

    test('should be return false when values do not match', async () => {
      const value = 'wrongPassword'
      const encoded = 'hashedPassword123'

      vi.mocked(bcrypt.compare).mockImplementation(() => false)

      const result = await bcryptService.compare({ value, encoded })

      expect(result).toBe(false)
      expect(bcrypt.compare).toHaveBeenCalledWith(value, encoded)
    })
  })
})
