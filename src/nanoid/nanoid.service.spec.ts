import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { mock, MockProxy } from 'vitest-mock-extended'
import { customAlphabet } from 'nanoid'
import { NanoidService } from './nanoid.service'
import { NanoidModuleOptions } from './types'
import { getFakeNanoid } from '@/test/utils'
import { MODULE_OPTIONS_TOKEN } from '@/nanoid/nanoid.module-definition'

vi.mock('nanoid', { spy: true })

describe('NanoidService', () => {
  let nanoidService: NanoidService
  let options: MockProxy<NanoidModuleOptions>

  beforeEach(async () => {
    options = mock<NanoidModuleOptions>({
      customAlphabet: {
        alphabet:
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      },
    })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NanoidService,
        { provide: MODULE_OPTIONS_TOKEN, useValue: options },
      ],
    }).compile()

    nanoidService = module.get<NanoidService>(NanoidService)
  })

  describe('customAlphabet', () => {
    test('should be generate a nanoid with custom alphabet', () => {
      const expected = getFakeNanoid()
      const mockGenerator = vi.fn().mockReturnValue(expected)

      vi.mocked(customAlphabet).mockReturnValue(mockGenerator)

      const result = nanoidService.customAlphabet()

      expect(result).toBe(expected)
      expect(customAlphabet).toHaveBeenCalledWith(
        options.customAlphabet.alphabet,
        options.customAlphabet.defaultSize,
      )
      expect(mockGenerator).toHaveBeenCalled()
    })

    test('should be generate unique ids on multiple calls', () => {
      const mockGenerator = vi
        .fn()
        .mockReturnValueOnce('id-1')
        .mockReturnValueOnce('id-2')
        .mockReturnValueOnce('id-3')

      vi.mocked(customAlphabet).mockReturnValue(mockGenerator)

      const result1 = nanoidService.customAlphabet()
      const result2 = nanoidService.customAlphabet()
      const result3 = nanoidService.customAlphabet()

      expect(result1).toBe('id-1')
      expect(result2).toBe('id-2')
      expect(result3).toBe('id-3')
      expect(mockGenerator).toHaveBeenCalledTimes(3)
    })
  })
})
