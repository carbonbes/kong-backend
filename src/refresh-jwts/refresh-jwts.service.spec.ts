import { Test, TestingModule } from '@nestjs/testing'
import { RefreshJwtsService } from './refresh-jwts.service'

describe('RefreshJwtsService', () => {
  let service: RefreshJwtsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefreshJwtsService],
    }).compile()

    service = module.get<RefreshJwtsService>(RefreshJwtsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
