import { Test, TestingModule } from '@nestjs/testing'
import { AuthJwtsService } from './auth-jwts.service'

describe('AuthJwtsService', () => {
  let service: AuthJwtsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthJwtsService],
    }).compile()

    service = module.get<AuthJwtsService>(AuthJwtsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
