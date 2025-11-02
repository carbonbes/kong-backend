import { Test, TestingModule } from '@nestjs/testing'
import { JwtStorageService } from './jwt-storage.service'

describe('JwtStorageService', () => {
  let service: JwtStorageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStorageService],
    }).compile()

    service = module.get<JwtStorageService>(JwtStorageService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
