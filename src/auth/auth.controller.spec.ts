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
  let authController: AuthController
  let authService: DeepMocked<AuthService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker(createMock)
      .compile()

    authController = module.get(AuthController)
    authService = module.get(AuthService)
  })

  describe('signUp', () => {
    let mockAuthControllerSignUp: MockInstance<typeof authController.signUp>
    let body: SignUpDto

    beforeEach(() => {
      const { email, name, gender } = createFakeUser()
      body = { email, name, gender }
      mockAuthControllerSignUp = vi.spyOn(authController, 'signUp')
    })

    afterEach(() => mockAuthControllerSignUp.mockRestore())

    test('should be return the otp ID and user ID', async () => {
      const user = createFakeUser({ ...body })
      const otp = createFakeOtp({ type: OtpType.SIGN_UP, userId: user.id })

      const result: LoginReturn = {
        otpId: otp.id,
        userId: otp.userId,
      }

      authService.signUp.mockResolvedValue(result)

      expect(await authController.signUp(body)).toEqual(result)
      expect(mockAuthControllerSignUp).toHaveBeenCalledWith(body)
    })

    test('should be return null', async () => {
      const result: LoginReturn = null

      authService.signUp.mockResolvedValue(result)

      expect(await authController.signUp(body)).toBe(result)
      expect(mockAuthControllerSignUp).toHaveBeenCalledWith(body)
    })
  })

  describe('signIn', () => {
    let mockAuthControllerSignIn: MockInstance<typeof authController.signIn>
    let body: SignInDto

    beforeEach(() => {
      const { email } = createFakeUser()
      body = { email }
      mockAuthControllerSignIn = vi.spyOn(authController, 'signIn')
    })

    afterEach(() => mockAuthControllerSignIn.mockRestore())

    test('should be return the otp ID and user ID', async () => {
      const user = createFakeUser({ ...body })
      const otp = createFakeOtp({ type: OtpType.SIGN_IN, userId: user.id })

      const result: LoginReturn = {
        otpId: otp.id,
        userId: otp.userId,
      }

      authService.signIn.mockResolvedValue(result)

      expect(await authController.signIn(body)).toEqual(result)
      expect(mockAuthControllerSignIn).toHaveBeenCalledWith(body)
    })

    test('should be return null', async () => {
      const result: LoginReturn = null

      authService.signIn.mockResolvedValue(result)

      expect(await authController.signIn(body)).toBe(result)
      expect(mockAuthControllerSignIn).toHaveBeenCalledWith(body)
    })

    test('should be return 403', async () => {
      authService.signIn.mockRejectedValue(new ForbiddenException())

      await expect(authController.signIn(body)).rejects.toThrow(
        ForbiddenException,
      )
      expect(mockAuthControllerSignIn).toHaveBeenCalledWith(body)
    })
  })

  describe('verifyOtp', () => {
    let body: VerifyOtpDto
    let mockAuthControllerVerifyOtp: MockInstance<
      typeof authController.verifyOtp
    >

    const { res, clearMockRes } = getMockRes()

    beforeEach(() => {
      body = createFakeOtp()
      clearMockRes()
      mockAuthControllerVerifyOtp = vi.spyOn(authController, 'verifyOtp')
    })

    afterEach(() => mockAuthControllerVerifyOtp.mockRestore())

    test('should be return undefined', async () => {
      authService.verifyOtp.mockResolvedValue(undefined)

      await expect(authController.verifyOtp(body, res)).resolves.toBeUndefined()
      expect(mockAuthControllerVerifyOtp).toHaveBeenCalledWith(body, res)
    })

    test('should be return 404', async () => {
      authService.verifyOtp.mockRejectedValue(new NotFoundException())

      await expect(authController.verifyOtp(body, res)).rejects.toThrow(
        NotFoundException,
      )
      expect(mockAuthControllerVerifyOtp).toHaveBeenCalledWith(body, res)
    })
  })

  describe('me', () => {
    test('should be return a user', async () => {
      const user = createFakeUser()
      const req = getMockReq({ user })

      const mockAuthControllerMe = vi.spyOn(authController, 'me')

      expect(await authController.me(req)).toEqual(user)
      expect(mockAuthControllerMe).toHaveBeenCalledWith(req)
    })
  })

  describe('update', () => {
    test('should be return undefined', async () => {
      const { res } = getMockRes()
      const jwts = createFakeJwts()

      authService.rotate.mockResolvedValue(undefined)

      const mockAuthControllerUpdate = vi.spyOn(authController, 'update')

      expect(await authController.update(jwts, res)).toBeUndefined()
      expect(mockAuthControllerUpdate).toHaveBeenCalledWith(jwts, res)
    })
  })

  describe('logout', () => {
    test('should be return undefined', async () => {
      const { res } = getMockRes()
      const jwts = createFakeJwts()

      authService.logout.mockResolvedValue(undefined)

      const mockAuthControllerLogout = vi.spyOn(authController, 'logout')

      expect(await authController.logout(jwts, res)).toBeUndefined()
      expect(mockAuthControllerLogout).toHaveBeenCalledWith(jwts, res)
    })
  })
})
