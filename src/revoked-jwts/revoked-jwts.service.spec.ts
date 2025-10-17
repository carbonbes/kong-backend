import { beforeEach, describe, expect, test } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { RevokedJwtsService } from './revoked-jwts.service'

describe('RevokedJwtsService', () => {
  let service: RevokedJwtsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RevokedJwtsService],
    }).compile()

    service = module.get<RevokedJwtsService>(RevokedJwtsService)
  })

  test('should be defined', () => {
    expect(service).toBeDefined()
  })
})
