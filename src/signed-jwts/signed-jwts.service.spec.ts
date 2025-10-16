import { describe, beforeEach, test, expect } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { SignedJwtsService } from './signed-jwts.service'

describe('SignedJwtsService', () => {
  let service: SignedJwtsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignedJwtsService],
    }).compile()

    service = module.get<SignedJwtsService>(SignedJwtsService)
  })

  test('should be defined', () => {
    expect(service).toBeDefined()
  })
})
