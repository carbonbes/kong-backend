import { Test, TestingModule } from '@nestjs/testing'
import { AccessJwtService } from './access-jwt.service'

describe('AccessJwtService', () => {
  let service: AccessJwtService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessJwtService],
    }).compile()

    service = module.get<AccessJwtService>(AccessJwtService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
