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
import { UsersService } from '@/users/users.service'
import { MailService } from '@/mail/mail.service'
import { OtpsService } from '@/otps/otps.service'
import { JwtsService } from '@/jwts/jwts.service'
import {
  mockedJwtsService,
  mockedMailService,
  mockedOtpsService,
  mockedUsersService,
} from '@/test/mocks'
import { SignInDto, SignUpDto, VerifyOtpDto } from '@/auth/auth.dtos'

describe('AuthController', () => {
  let controller: AuthController
  let service: AuthService

  const usersService = mockedUsersService
  const mailService = mockedMailService
  const otpsService = mockedOtpsService
  const jwtsService = mockedJwtsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: MailService, useValue: mailService },
        { provide: OtpsService, useValue: otpsService },
        { provide: JwtsService, useValue: jwtsService },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    service = module.get<AuthService>(AuthService)
  })

  describe('signUp', () => {
    let spy: MockInstance<typeof controller.signUp>
    let body: SignUpDto

    beforeEach(() => {
      const { email, name, gender } = createFakeUser()
      body = { email, name, gender }
      spy = vi.spyOn(controller, 'signUp')
    })

    afterEach(() => spy.mockRestore())

    test('should be return the otp ID and user ID', async () => {
      const user = createFakeUser({ ...body })
      const otp = createFakeOtp({ type: OtpType.SIGN_UP, userId: user.id })

      const result: LoginReturn = {
        otpId: otp.id,
        userId: otp.userId,
      }

      vi.spyOn(service, 'signUp').mockResolvedValue(result)

      expect(await controller.signUp(body)).toEqual(result)
      expect(spy).toHaveBeenCalledWith(body)
    })

    test('should be return null', async () => {
      const result: LoginReturn = null

      vi.spyOn(service, 'signUp').mockResolvedValue(result)

      expect(await controller.signUp(body)).toBe(result)
      expect(spy).toHaveBeenCalledWith(body)
    })
  })

  describe('signIn', () => {
    let spy: MockInstance<typeof controller.signIn>
    let body: SignInDto

    beforeEach(() => {
      const { email } = createFakeUser()
      body = { email }
      spy = vi.spyOn(controller, 'signIn')
    })

    afterEach(() => spy.mockRestore())

    test('should be return the otp ID and user ID', async () => {
      const user = createFakeUser({ ...body })
      const otp = createFakeOtp({ type: OtpType.SIGN_IN, userId: user.id })

      const result: LoginReturn = {
        otpId: otp.id,
        userId: otp.userId,
      }

      vi.spyOn(service, 'signIn').mockResolvedValue(result)

      expect(await controller.signIn(body)).toEqual(result)
      expect(spy).toHaveBeenCalledWith(body)
    })

    test('should be return null', async () => {
      const result: LoginReturn = null

      vi.spyOn(service, 'signIn').mockResolvedValue(result)

      expect(await controller.signIn(body)).toBe(result)
      expect(spy).toHaveBeenCalledWith(body)
    })

    test('should be return 403', async () => {
      vi.spyOn(service, 'signIn').mockRejectedValue(new ForbiddenException())

      await expect(controller.signIn(body)).rejects.toThrow(ForbiddenException)
      expect(spy).toHaveBeenCalledWith(body)
    })
  })

  describe('verifyOtp', () => {
    let body: VerifyOtpDto
    let spy: MockInstance<typeof controller.verifyOtp>

    const { res, clearMockRes } = getMockRes()

    beforeEach(() => {
      body = createFakeOtp()
      clearMockRes()
      spy = vi.spyOn(controller, 'verifyOtp')
    })

    afterEach(() => spy.mockRestore())

    test('should be return undefined', async () => {
      vi.spyOn(service, 'verifyOtp').mockResolvedValue(undefined)

      await expect(controller.verifyOtp(body, res)).resolves.toBeUndefined()
      expect(spy).toHaveBeenCalledWith(body, res)
    })

    test('should be return 404', async () => {
      vi.spyOn(service, 'verifyOtp').mockRejectedValue(new NotFoundException())

      await expect(controller.verifyOtp(body, res)).rejects.toThrow(
        NotFoundException,
      )
      expect(spy).toHaveBeenCalledWith(body, res)
    })
  })

  describe('me', () => {
    test('should be return a user', async () => {
      const user = createFakeUser()
      const req = getMockReq({ user })

      const spy = vi.spyOn(controller, 'me')

      expect(await controller.me(req)).toEqual(user)
      expect(spy).toHaveBeenCalledWith(req)
    })
  })

  describe('update', () => {
    test('should be return undefined', async () => {
      const { res } = getMockRes()
      const jwts = createFakeJwts()

      vi.spyOn(service, 'rotate').mockResolvedValue(undefined)
      const spy = vi.spyOn(controller, 'update')

      expect(await controller.update(jwts, res)).toBeUndefined()
      expect(spy).toHaveBeenCalledWith(jwts, res)
    })
  })

  describe('logout', () => {
    test('should be return undefined', async () => {
      const { res } = getMockRes()
      const jwts = createFakeJwts()

      vi.spyOn(service, 'logout').mockResolvedValue(undefined)
      const spy = vi.spyOn(controller, 'logout')

      expect(await controller.logout(jwts, res)).toBeUndefined()
      expect(spy).toHaveBeenCalledWith(jwts, res)
    })
  })
})
