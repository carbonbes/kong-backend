import { beforeEach, describe, expect, test } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { JwtsService } from './jwts.service'
import { SignOptions } from './jwts.types'

describe('JwtsService', () => {
  let service: JwtsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtsService],
    }).compile()

    service = module.get<JwtsService>(JwtsService)
  })

  test('sign', () => {
    const signOptions: SignOptions = 1

    expect(service).toBeDefined()
  })
})
