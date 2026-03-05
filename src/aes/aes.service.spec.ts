import { Test, TestingModule } from '@nestjs/testing'
import { AesService } from './aes.service'

describe('AesService', () => {
  let aesService: AesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AesService],
    }).compile()

    aesService = module.get<AesService>(AesService)
  })

  test('should be encrypt a value', () => {
    const value = 'test'

    expect(aesService).toBeDefined()
  })
})
