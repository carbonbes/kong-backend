import { Test, TestingModule } from '@nestjs/testing'
import { AccessJwtsService } from './access-jwts.service'

describe('AccessJwtsService', () => {
  let service: AccessJwtsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessJwtsService],
    }).compile()

    service = module.get<AccessJwtsService>(AccessJwtsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
