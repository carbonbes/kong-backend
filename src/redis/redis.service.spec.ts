import { beforeEach, describe, expect, test } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { RedisService } from './redis.service'
import { MODULE_OPTIONS_TOKEN } from './redis.module-definition'
import { ConfigModuleOptions } from '@nestjs/config'

describe('RedisService', () => {
  let service: RedisService
  let moduleOptions: ConfigModuleOptions

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        { provide: MODULE_OPTIONS_TOKEN, useValue: moduleOptions },
      ],
    }).compile()

    service = module.get<RedisService>(RedisService)
  })

  test('getClient', () => {
    const result = service.getClient()

    expect(result).toBeDefined()
  })
})
