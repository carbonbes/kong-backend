import { Test, TestingModule } from '@nestjs/testing'
import { HashService } from './hash.service'

describe('HashService', () => {
  let hashService: HashService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashService],
    }).compile()

    hashService = module.get<HashService>(HashService)
  })

  test('should be defined', () => {
    expect(hashService).toBeDefined()
  })
})
