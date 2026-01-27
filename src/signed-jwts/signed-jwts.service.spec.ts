import { describe, beforeEach, test, expect, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { SignedJwtsService } from './signed-jwts.service'
import { RedisClient } from '@/shared/redis/redis.types'
import { REDIS_CLIENT } from '@/shared/redis/redis.consts'
import { AddOptions, GetAllOptions, GetOptions } from './signed-jwts.types'

describe('SignedJwtsService', () => {
  let service: SignedJwtsService
  let redis: Pick<RedisClient, 'hSet' | 'sendCommand' | 'hGet' | 'hGetAll'>

  redis = {
    hSet: vi.fn(),
    sendCommand: vi.fn(),
    hGet: vi.fn(),
    hGetAll: vi.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignedJwtsService,
        { provide: REDIS_CLIENT, useValue: redis },
      ],
    }).compile()

    service = module.get<SignedJwtsService>(SignedJwtsService)
    redis = module.get<RedisClient>(REDIS_CLIENT)
  })

  test('add', async () => {
    const addOptions: AddOptions = {
      jti: '1-2-3-4-5',
      sub: 1,
      exp: new Date().getTime(),
    }

    vi.spyOn(redis, 'hSet').mockImplementation(async () => 1)
    vi.spyOn(redis, 'sendCommand').mockImplementation(async () => 1)

    const result = await service.add(addOptions)

    expect(result).toBeTruthy()
  })

  test('get', async () => {
    const getOptions: GetOptions = { sub: 1, field: '' }

    vi.spyOn(redis, 'hGet').mockImplementation(async () => '')

    const result = await service.get(getOptions)

    expect(result).toBe('')
  })

  test('getAll', async () => {
    const getAllOptions: GetAllOptions = { sub: 1 }

    vi.spyOn(redis, 'hGetAll').mockImplementation(async () => ['1', '2'])

    const result = await service.getAll(getAllOptions)

    expect(result).toEqual(['1', '2'])
  })
})
