import { Test, TestingModule } from '@nestjs/testing'
import { RefreshJwtService } from './refresh-jwt.service'

describe('RefreshJwtService', () => {
  let service: RefreshJwtService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefreshJwtService],
    }).compile()

    service = module.get<RefreshJwtService>(RefreshJwtService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
