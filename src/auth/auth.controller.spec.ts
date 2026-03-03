import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { LoginReturn, LogoutOptions, UpdateOptions } from './types'
import { OtpType } from '@/otps/enums'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { getMockReq } from 'vitest-mock-express'
import { getFakeAuthJwts, getFakeOtp, getFakeUser } from '@/test/utils'
import { SignInDto, SignUpDto, VerifyOtpDto } from '@/auth/dtos'
import { mock, MockProxy } from 'vitest-mock-extended'
import { RefreshJwtDto } from '@/refresh-jwt/dtos'
import { AccessJwtDto } from '@/access-jwt/dtos'

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
      const otp = getFakeOtp({ type: OtpType.SIGN_UP, userId: user.id })

      const result: LoginReturn = {
        otpId: otp.id,
        userId: otp.userId,
      }

      authService.signUp.mockResolvedValue(result)

      expect(await authController.signUp(body)).toEqual(result)
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
      const jwts = getFakeAuthJwts()

      authService.verifyOtp.mockResolvedValue(jwts)

      expect(await authController.verifyOtp(body)).toEqual(jwts)
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

      expect(await authController.me(req)).toEqual(user)
    })
  })

  describe('update', () => {
    test('should be return new JWT pair', async () => {
      const oldJwts = getFakeAuthJwts()
      const newJwts = getFakeAuthJwts()
      const refreshToken = oldJwts.refreshToken

      authService.update.mockResolvedValue(newJwts)

      const authServiceRotateOptions: UpdateOptions = refreshToken

      expect(await authController.update(refreshToken)).toEqual(newJwts)
      expect(authService.update).toHaveBeenCalledWith(authServiceRotateOptions)
    })
  })

  describe('logout', () => {
    test('should be return undefined', async () => {
      const jwts = getFakeAuthJwts()
      const body: RefreshJwtDto = { refreshToken: jwts.refreshToken }
      const accessToken = jwts.accessToken

      authService.logout.mockResolvedValue(undefined)

      const authServiceLogoutOptions: LogoutOptions = {
        accessToken,
        refreshToken: body.refreshToken,
      }

      expect(await authController.logout(accessToken, body)).toBeUndefined()
      expect(authService.logout).toHaveBeenCalledWith(authServiceLogoutOptions)
    })
  })
})
