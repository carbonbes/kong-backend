import {
  afterEach,
  beforeEach,
  describe,
  expect,
  MockInstance,
  test,
  vi,
} from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { LoginReturn } from './auth.types'
import { OtpType } from '@/otps/otps.enums'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { getMockReq, getMockRes } from 'vitest-mock-express'
import { createFakeJwts, createFakeOtp, createFakeUser } from '@/test/utils'
import { SignInDto, SignUpDto, VerifyOtpDto } from '@/auth/auth.dtos'
import { createMock, DeepMocked } from '@golevelup/ts-vitest'

describe('AuthController', () => {
  let controller: AuthController
  let service: DeepMocked<AuthService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker(createMock)
      .compile()

    controller = module.get(AuthController)
    service = module.get(AuthService)
  })

  describe('signUp', () => {
    let mockSignUp: MockInstance<typeof controller.signUp>
    let body: SignUpDto

    beforeEach(() => {
      const { email, name, gender } = createFakeUser()
      body = { email, name, gender }
      mockSignUp = vi.spyOn(controller, 'signUp')
    })

    afterEach(() => mockSignUp.mockRestore())

    test('should be return the otp ID and user ID', async () => {
      const user = createFakeUser({ ...body })
      const otp = createFakeOtp({ type: OtpType.SIGN_UP, userId: user.id })

      const result: LoginReturn = {
        otpId: otp.id,
        userId: otp.userId,
      }

      service.signUp.mockResolvedValue(result)

      expect(await controller.signUp(body)).toEqual(result)
      expect(mockSignUp).toHaveBeenCalledWith(body)
    })

    test('should be return null', async () => {
      const result: LoginReturn = null

      service.signUp.mockResolvedValue(result)

      expect(await controller.signUp(body)).toBe(result)
      expect(mockSignUp).toHaveBeenCalledWith(body)
    })
  })

  describe('signIn', () => {
    let mockSignIn: MockInstance<typeof controller.signIn>
    let body: SignInDto

    beforeEach(() => {
      const { email } = createFakeUser()
      body = { email }
      mockSignIn = vi.spyOn(controller, 'signIn')
    })

    afterEach(() => mockSignIn.mockRestore())

    test('should be return the otp ID and user ID', async () => {
      const user = createFakeUser({ ...body })
      const otp = createFakeOtp({ type: OtpType.SIGN_IN, userId: user.id })

      const result: LoginReturn = {
        otpId: otp.id,
        userId: otp.userId,
      }

      service.signIn.mockResolvedValue(result)

      expect(await controller.signIn(body)).toEqual(result)
      expect(mockSignIn).toHaveBeenCalledWith(body)
    })

    test('should be return null', async () => {
      const result: LoginReturn = null

      service.signIn.mockResolvedValue(result)

      expect(await controller.signIn(body)).toBe(result)
      expect(mockSignIn).toHaveBeenCalledWith(body)
    })

    test('should be return 403', async () => {
      service.signIn.mockRejectedValue(new ForbiddenException())

      await expect(controller.signIn(body)).rejects.toThrow(ForbiddenException)
      expect(mockSignIn).toHaveBeenCalledWith(body)
    })
  })

  describe('verifyOtp', () => {
    let body: VerifyOtpDto
    let mockVerifyOtp: MockInstance<typeof controller.verifyOtp>

    const { res, clearMockRes } = getMockRes()

    beforeEach(() => {
      body = createFakeOtp()
      clearMockRes()
      mockVerifyOtp = vi.spyOn(controller, 'verifyOtp')
    })

    afterEach(() => mockVerifyOtp.mockRestore())

    test('should be return undefined', async () => {
      service.verifyOtp.mockResolvedValue(undefined)

      await expect(controller.verifyOtp(body, res)).resolves.toBeUndefined()
      expect(mockVerifyOtp).toHaveBeenCalledWith(body, res)
    })

    test('should be return 404', async () => {
      service.verifyOtp.mockRejectedValue(new NotFoundException())

      await expect(controller.verifyOtp(body, res)).rejects.toThrow(
        NotFoundException,
      )
      expect(mockVerifyOtp).toHaveBeenCalledWith(body, res)
    })
  })

  describe('me', () => {
    test('should be return a user', async () => {
      const user = createFakeUser()
      const req = getMockReq({ user })

      const mockMe = vi.spyOn(controller, 'me')

      expect(await controller.me(req)).toEqual(user)
      expect(mockMe).toHaveBeenCalledWith(req)
    })
  })

  describe('update', () => {
    test('should be return undefined', async () => {
      const { res } = getMockRes()
      const jwts = createFakeJwts()

      service.rotate.mockResolvedValue(undefined)

      const mockUpdate = vi.spyOn(controller, 'update')

      expect(await controller.update(jwts, res)).toBeUndefined()
      expect(mockUpdate).toHaveBeenCalledWith(jwts, res)
    })
  })

  describe('logout', () => {
    test('should be return undefined', async () => {
      const { res } = getMockRes()
      const jwts = createFakeJwts()

      service.logout.mockResolvedValue(undefined)

      const mockLogout = vi.spyOn(controller, 'logout')

      expect(await controller.logout(jwts, res)).toBeUndefined()
      expect(mockLogout).toHaveBeenCalledWith(jwts, res)
    })
  })
})
