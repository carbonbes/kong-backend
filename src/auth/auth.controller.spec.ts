import { beforeEach, describe, expect, test } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { LoginReturn, LogoutOptions, RotateOptions } from './auth.types'
import { OtpType } from '@/otps/otps.enums'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { getMockReq } from 'vitest-mock-express'
import { getFakeJwts, getFakeOtp, getFakeUser } from '@/test/utils'
import {
  AccessTokenDto,
  RefreshTokenDto,
  SignInDto,
  SignUpDto,
  VerifyOtpDto,
} from '@/auth/auth.dtos'
import { mock, MockProxy } from 'vitest-mock-extended'

describe('AuthController', () => {
  let authController: AuthController
  let authService: MockProxy<AuthService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker(mock)
      .compile()

    authController = module.get(AuthController)
    authService = module.get(AuthService)
  })

  describe('signUp', () => {
    let body: SignUpDto

    beforeEach(() => {
      const { email, name, gender } = getFakeUser()
      body = { email, name, gender }
    })

    test('should be return the otp ID and user ID', async () => {
      const user = getFakeUser({ ...body })
      const otp = getFakeOtp({ type: OtpType.SIGN_UP, userId: user.id })

      const result: LoginReturn = {
        otpId: otp.id,
        userId: otp.userId,
      }

      authService.signUp.mockResolvedValue(result)

      expect(await authController.signUp(body)).toEqual(result)
      expect(authService.signUp).toHaveBeenCalledWith(body)
    })

    test('should be return null', async () => {
      const result: LoginReturn = null

      authService.signUp.mockResolvedValue(result)

      expect(await authController.signUp(body)).toBe(result)
      expect(authService.signUp).toHaveBeenCalledWith(body)
    })
  })

  describe('signIn', () => {
    let body: SignInDto

    beforeEach(() => {
      const { email } = getFakeUser()
      body = { email }
    })

    test('should be return the otp ID and user ID', async () => {
      const user = getFakeUser({ ...body })
      const otp = getFakeOtp({ type: OtpType.SIGN_IN, userId: user.id })

      const result: LoginReturn = {
        otpId: otp.id,
        userId: otp.userId,
      }

      authService.signIn.mockResolvedValue(result)

      expect(await authController.signIn(body)).toEqual(result)
      expect(authService.signIn).toHaveBeenCalledWith(body)
    })

    test('should be return null', async () => {
      const result: LoginReturn = null

      authService.signIn.mockResolvedValue(result)

      expect(await authController.signIn(body)).toBe(result)
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
      const jwts = getFakeJwts()

      authService.verifyOtp.mockResolvedValue(jwts)

      expect(await authController.verifyOtp(body)).toEqual(jwts)
      expect(authService.verifyOtp).toHaveBeenCalledWith(body)
    })

    test('should be return 404', async () => {
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

      expect(await authController.me(req)).toEqual(user)
    })
  })

  describe('update', () => {
    test('should be return new JWT pair', async () => {
      const oldJwts = getFakeJwts()
      const newJwts = getFakeJwts()
      const body: AccessTokenDto = { access_token: oldJwts.access_token }
      const refresh_token = oldJwts.refresh_token

      authService.rotate.mockResolvedValue(newJwts)

      const authServiceRotateOptions: RotateOptions = {
        access_token: body.access_token,
        refresh_token,
      }

      expect(await authController.update(refresh_token, body)).toEqual(newJwts)
      expect(authService.rotate).toHaveBeenCalledWith(authServiceRotateOptions)
    })
  })

  describe('logout', () => {
    test('should be return undefined', async () => {
      const jwts = getFakeJwts()
      const body: RefreshTokenDto = { refresh_token: jwts.refresh_token }
      const access_token = jwts.access_token

      authService.logout.mockResolvedValue(undefined)

      const authServiceLogoutOptions: LogoutOptions = {
        access_token,
        refresh_token: body.refresh_token,
      }

      expect(await authController.logout(access_token, body)).toBeUndefined()
      expect(authService.logout).toHaveBeenCalledWith(authServiceLogoutOptions)
    })
  })
})
