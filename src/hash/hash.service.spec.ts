import { Test, TestingModule } from '@nestjs/testing'
import { HashService } from './hash.service'
import { MODULE_OPTIONS_TOKEN } from '@/hash/hash.module-definition'
import { GenerateOptions } from '@/hash/types'
import { createHmac } from 'node:crypto'

vi.mock('node:crypto', () => ({
  createHmac: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('hashed'),
  }),
}))

describe('HashService', () => {
  let hashService: HashService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HashService,
        {
          provide: MODULE_OPTIONS_TOKEN,
          useValue: { algorithm: 'sha512', secret: 'secret' },
        },
      ],
    }).compile()

    hashService = module.get<HashService>(HashService)
  })

  describe('generate', () => {
    test('should be generate sha512-hash', () => {
      const options: GenerateOptions = { value: 'Test' }

      const result = hashService.generate(options)

      expect(result).toBe('hashed')
      expect(createHmac).toHaveBeenCalledWith('sha512', 'secret')
    })
  })
})
