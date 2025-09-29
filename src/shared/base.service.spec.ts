import { beforeEach, describe, expect, test } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { BaseService } from './base.service'

describe('BaseService', () => {
  let service: BaseService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaseService],
    }).compile()

    service = module.get<BaseService>(BaseService)
  })

  test('should be defined', () => {
    expect(service).toBeDefined()
  })
})
