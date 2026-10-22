import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { getMockReq, getMockRes } from 'vitest-mock-express'
import {
  getFakeAuthJwts,
  getFakeEmail,
  getFakeJwt,
  getFakeOtp,
  getFakeUser,
} from '@/test/utils'
import { ResendOtpDto, SignInDto, SignUpDto, VerifyOtpDto } from '@/auth/dtos'
import { mock, MockProxy } from 'vitest-mock-extended'
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from '@/shared/consts'
import { Response } from 'express'

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

    test('should be return 201', async () => {
      authService.signUp.mockResolvedValue(undefined)

      const result = await authController.signUp(body)

      expect(result).toEqual(undefined)
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

    test('should be return 201', async () => {
      authService.signIn.mockResolvedValue(undefined)

      const result = await authController.signIn(body)

      expect(result).toEqual(undefined)
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

  describe('resendOtp', () => {
    let body: ResendOtpDto

    beforeEach(() => {
      body = { email: getFakeEmail(), type: getFakeOtp().type }
    })

    test('should be return 200', async () => {
      authService.resendOtp.mockResolvedValue(undefined)

      const result = await authController.resendOtp(body)

      expect(authService.resendOtp).toHaveBeenCalledWith(body)
      expect(result).toEqual(undefined)
    })

    test('should be return 403', async () => {
      authService.resendOtp.mockRejectedValue(new ForbiddenException())

      await expect(authController.resendOtp(body)).rejects.toThrow(
        ForbiddenException,
      )
      expect(authService.resendOtp).toHaveBeenCalledWith(body)
    })
  })

  describe('verifyOtp', () => {
    let body: VerifyOtpDto
    let res: Response

    beforeEach(() => {
      body = getFakeOtp()

      const { res: response } = getMockRes()
      res = response
    })

    test('should be return jwts and user', async () => {
      const user = getFakeUser()
      const jwts = getFakeAuthJwts({
        accessJwtOptions: { payload: { sub: user.email } },
        refreshJwtOptions: { payload: { sub: user.email } },
      })

      authService.verifyOtp.mockResolvedValue({ ...jwts, user })

      const result = await authController.verifyOtp(body, res)

      expect(authService.verifyOtp).toHaveBeenCalledWith(body)
      expect(res.cookie).toHaveBeenNthCalledWith(
        1,
        ACCESS_TOKEN_COOKIE_NAME,
        jwts.accessToken,
        {
          httpOnly: true,
          maxAge: Number(process.env.ACCESS_JWT_EXPIRES_IN) * 1000,
          sameSite: 'lax',
          secure: false,
        },
      )
      expect(res.cookie).toHaveBeenNthCalledWith(
        2,
        REFRESH_TOKEN_COOKIE_NAME,
        jwts.refreshToken,
        {
          httpOnly: true,
          maxAge: Number(process.env.ACCESS_JWT_EXPIRES_IN) * 1000,
          sameSite: 'lax',
          secure: false,
        },
      )
      expect(result).toEqual({ user })
    })

    test('should be return 403', async () => {
      authService.verifyOtp.mockRejectedValue(new NotFoundException())

      await expect(authController.verifyOtp(body, res)).rejects.toThrow(
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
      const { res } = getMockRes()
      const oldAuthJwts = getFakeAuthJwts()
      const newAuthJwts = getFakeAuthJwts()
      const refreshToken = oldAuthJwts.refreshToken

      authService.update.mockResolvedValue(newAuthJwts)

      const result = await authController.update(refreshToken, res)

      expect(authService.update).toHaveBeenCalledWith(refreshToken)
      expect(res.cookie).toHaveBeenNthCalledWith(
        1,
        ACCESS_TOKEN_COOKIE_NAME,
        newAuthJwts.accessToken,
        {
          httpOnly: true,
          maxAge: Number(process.env.ACCESS_JWT_EXPIRES_IN) * 1000,
          sameSite: 'lax',
          secure: false,
        },
      )
      expect(res.cookie).toHaveBeenNthCalledWith(
        2,
        REFRESH_TOKEN_COOKIE_NAME,
        newAuthJwts.refreshToken,
        {
          httpOnly: true,
          maxAge: Number(process.env.ACCESS_JWT_EXPIRES_IN) * 1000,
          sameSite: 'lax',
          secure: false,
        },
      )
      expect(result).toBeUndefined()
    })
  })

  describe('logout', () => {
    test('should be return undefined', async () => {
      const { res } = getMockRes()
      const refreshToken = getFakeJwt()

      authService.logout.mockResolvedValue(undefined)

      expect(await authController.logout(refreshToken, res)).toBeUndefined()
      expect(authService.logout).toHaveBeenCalledWith(refreshToken)
      expect(res.clearCookie).toHaveBeenNthCalledWith(
        1,
        ACCESS_TOKEN_COOKIE_NAME,
      )
      expect(res.clearCookie).toHaveBeenNthCalledWith(
        2,
        REFRESH_TOKEN_COOKIE_NAME,
      )
    })
  })
})
