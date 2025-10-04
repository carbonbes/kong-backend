import { beforeEach, describe, expect, test } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { OtpsService } from './otps.service'

describe('OtpsService', () => {
  let service: OtpsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtpsService],
    }).compile()

    service = module.get<OtpsService>(OtpsService)
  })

  test('should be defined', () => {
    expect(service).toBeDefined()
  })
})
