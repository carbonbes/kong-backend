import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { RevokedJwtsSchema } from './revoked-jwts.schema'
import { RedisClient } from '@/redis/redis.types'
import { REDIS_CLIENT } from '@/redis/redis.consts'
import { AddOptions, GetOptions, HasOptions } from './revoked-jwts.types'

describe('RevokedJwtsService', () => {
  let service: RevokedJwtsSchema
  let redis: Pick<RedisClient, 'set' | 'get'>

  redis = {
    set: vi.fn(),
    get: vi.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevokedJwtsSchema,
        { provide: REDIS_CLIENT, useValue: redis },
      ],
    }).compile()

    service = module.get<RevokedJwtsSchema>(RevokedJwtsSchema)
    redis = module.get<RedisClient>(REDIS_CLIENT)
  })

  test('add', async () => {
    const addOptions: AddOptions = {
      jti: '1-2-3-4-5',
      exp: new Date().getTime(),
    }

    vi.spyOn(redis, 'set').mockImplementation(async () => 'OK')

    const result = await service.add(addOptions)

    expect(result).toBe('OK')
  })

  test('get', async () => {
    const key = '1-2-3-4-5'
    const getOptions: GetOptions = key

    vi.spyOn(redis, 'get').mockImplementation(async () => key)

    const result = await service.get(getOptions)

    expect(result).toBe(key)
  })

  test('has', async () => {
    const key = '1-2-3-4-5'
    const hasOptions: HasOptions = key

    vi.spyOn(redis, 'get').mockImplementation(async () => key)

    const result = await service.has(hasOptions)

    expect(result).toBeTruthy()
  })
})
