import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { OtpType } from '@/otps/enums'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { getMockReq } from 'vitest-mock-express'
import {
  getFakeAuthJwts,
  getFakeEmail,
  getFakeJwt,
  getFakeOtp,
  getFakeUser,
} from '@/test/utils'
import { SignInDto, SignUpDto, VerifyOtpDto } from '@/auth/dtos'
import { mock, MockProxy } from 'vitest-mock-extended'
import { RefreshJwtDto } from '@/refresh-jwt/dtos'

describe('AuthController', () => {
  let authController: AuthController
  let authService: MockProxy<AuthService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker(mock)
      .compile()

    authController = module.get<AuthController>(AuthController)
    authService = module.get<MockProxy<AuthService>>(AuthService)
  })

  describe('signUp', () => {
    let body: SignUpDto

    beforeEach(() => {
      const { email, name, gender } = getFakeUser()
      body = { email, name, gender }
    })

    test('should be return the otp ID and user ID', async () => {
      const user = getFakeUser({ ...body })
      const otp = getFakeOtp({ type: OtpType.SIGN_UP, email: user.email })

      authService.signUp.mockResolvedValue({ otpId: otp.id })

      const result = await authController.signUp(body)

      expect(result).toEqual({ otpId: otp.id })
      expect(authService.signUp).toHaveBeenCalledWith(body)
    })

    test('should be return 403', async () => {
      authService.signUp.mockRejectedValue(new ForbiddenException())

      await expect(authController.signUp(body)).rejects.toThrow(
        ForbiddenException,
      )
      expect(authService.signUp).toHaveBeenCalledWith(body)
    })
  })

  describe('signIn', () => {
    let body: SignInDto

    beforeEach(() => {
      body = { email: getFakeEmail() }
    })

    test('should be return the otp ID and user ID', async () => {
      const user = getFakeUser({ ...body })
      const otp = getFakeOtp({ type: OtpType.SIGN_IN, email: user.email })

      authService.signIn.mockResolvedValue({ otpId: otp.id })

      const result = await authController.signIn(body)

      expect(result).toEqual({ otpId: otp.id })
      expect(authService.signIn).toHaveBeenCalledWith(body)
    })

    test('should be return 403', async () => {
      authService.signIn.mockRejectedValue(new ForbiddenException())

      await expect(authController.signIn(body)).rejects.toThrow(
        ForbiddenException,
      )
      expect(authService.signIn).toHaveBeenCalledWith(body)
    })
  })

  describe('verifyOtp', () => {
    let body: VerifyOtpDto

    beforeEach(() => {
      body = getFakeOtp()
    })

    test('should be return JWT pair', async () => {
      const authJwts = getFakeAuthJwts()

      authService.verifyOtp.mockResolvedValue(authJwts)

      const result = await authController.verifyOtp(body)

      expect(result).toEqual(authJwts)
      expect(authService.verifyOtp).toHaveBeenCalledWith(body)
    })

    test('should be return 403', async () => {
      authService.verifyOtp.mockRejectedValue(new NotFoundException())

      await expect(authController.verifyOtp(body)).rejects.toThrow(
        NotFoundException,
      )
      expect(authService.verifyOtp).toHaveBeenCalledWith(body)
    })
  })

  describe('me', () => {
    test('should be return a user', async () => {
      const user = getFakeUser()
      const req = getMockReq({ user })

      const result = await authController.me(req)

      expect(result).toEqual(user)
    })
  })

  describe('update', () => {
    test('should be return new JWT pair', async () => {
      const oldAuthJwts = getFakeAuthJwts()
      const newAuthJwts = getFakeAuthJwts()
      const refreshToken = oldAuthJwts.refreshToken

      authService.update.mockResolvedValue(newAuthJwts)

      const result = await authController.update(refreshToken)

      expect(result).toEqual(newAuthJwts)
      expect(authService.update).toHaveBeenCalledWith(refreshToken)
    })
  })

  describe('logout', () => {
    test('should be return undefined', async () => {
      const refreshToken = getFakeJwt()
      const body: RefreshJwtDto = { refreshToken }

      authService.logout.mockResolvedValue(undefined)

      expect(await authController.logout(body)).toBeUndefined()
      expect(authService.logout).toHaveBeenCalledWith(body.refreshToken)
    })
  })
})
