import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { SignUpDto } from './auth.dtos'

describe('AuthController', () => {
  let controller: AuthController
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    service = module.get(AuthService)
  })

  test('signup', () => {
    const body: SignUpDto = {
      email: 'test@test.com',
      name: 'Test',
      gender: 'MALE',
    }

    vi.spyOn(service, 'signUp').mockImplementation(async () => ({
      otpId: '1-2-3-4-5',
      userId: 1,
    }))
  })
})
