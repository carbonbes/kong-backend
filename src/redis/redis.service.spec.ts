import { beforeEach, describe, expect, test } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { RedisService } from './redis.service'

describe('RedisService', () => {
  let service: RedisService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService],
    }).compile()

    service = module.get<RedisService>(RedisService)
  })

  test('should be defined', () => {
    expect(service).toBeDefined()
  })
})
