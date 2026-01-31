import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { UuidService } from './uuid.service'
import { getFakeUuid } from '@/test/utils'

describe('UuidService', () => {
  let uuidService: UuidService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UuidService],
    }).compile()

    uuidService = module.get(UuidService)
  })

  describe('generate', () => {
    test('should be generate a valid uuid', () => {
      const uuid = getFakeUuid()
      vi.spyOn(crypto, 'randomUUID').mockReturnValue(uuid)

      const result = uuidService.generate()

      expect(result).toBe(uuid)
      expect(crypto.randomUUID).toHaveBeenCalled()
    })
  })
})
