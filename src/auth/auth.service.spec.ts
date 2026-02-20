import { beforeEach, describe, expect, test } from 'vitest'
import { AuthService } from '@/auth/auth.service'
import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from '@/users/users.service'
import { MailService } from '@/shared/mail/mail.service'
import { OtpsService } from '@/otps/otps.service'
import { JwtsService } from '@/jwts/jwts.service'
import { getFakeJwts, getFakeOtp, getFakeUser } from '@/test/utils'
import { OtpType } from '@/otps/otps.enums'
import {
  LoginReturn,
  SignInOptions,
  SignUpOptions,
  VerifyOtpOptions,
} from '@/auth/auth.types'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { mock, MockProxy } from 'vitest-mock-extended'
import {
  CreateOptions as UsersServiceCreateOptions,
  FindOneOptions as UsersServiceFindOneOptions,
  IsExistOptions as UsersServiceIsExistOptions,
  SetActiveOptions as UsersServiceSetActiveOptions,
  User,
} from '@/users/users.types'
import {
  CreateOptions as OtpsServiceCreateOptions,
  VerifyOptions as OtpsServiceVerifyOptions,
} from '@/otps/otps.types'
import { SendOtpOptions as MailServiceSendOtpOptions } from '@/shared/mail/mail.types'
import {
  RotateOptions as JwtsServiceRotateOptions,
  SignOptions as JwtsServiceSignOptions,
} from '@/jwts/auth-jwts.types'

describe('AuthService', () => {
  let authService: AuthService
  let usersService: MockProxy<UsersService>
  let mailService: MockProxy<MailService>
  let otpsService: MockProxy<OtpsService>
  let authJwtsService: MockProxy<JwtsService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker(mock)
      .compile()

    authService = module.get(AuthService)
    usersService = module.get(UsersService)
    mailService = module.get(MailService)
    otpsService = module.get(OtpsService)
    jwtsService = module.get(JwtService)
  })

  describe('signUp', () => {
    let data: SignUpOptions

    beforeEach(() => {
      const { email, name, gender } = getFakeUser()
      data = { email, name, gender }
    })

    test('should be return a user ID and otp ID if a user with that email not exist', async () => {
      const user = getFakeUser({ ...data })
      const otp = getFakeOtp({ type: OtpType.SIGN_UP, userId: user.id })

      usersService.isExist.mockResolvedValue(false)
      usersService.create.mockResolvedValue(user)
      otpsService.create.mockResolvedValue(otp)
      mailService.sendOtp.mockResolvedValue(true)

      const result: LoginReturn = { otpId: otp.id, userId: user.id }
      const usersServiceIsExistOptions: UsersServiceIsExistOptions = {
        where: { email: user.email },
      }
      const usersServiceCreateOptions: UsersServiceCreateOptions = data
      const otpsServiceCreateOptions: OtpsServiceCreateOptions = {
        type: otp.type,
        userId: user.id,
      }
      const mailServiceSendOtpOptions: MailServiceSendOtpOptions = {
        email: user.email,
        code: otp.code,
        type: otp.type,
      }

      expect(await authService.signUp(data)).toEqual(result)
      expect(usersService.isExist).toHaveBeenCalledWith(
        usersServiceIsExistOptions,
      )
      expect(usersService.create).toHaveBeenCalledWith(
        usersServiceCreateOptions,
      )
      expect(otpsService.create).toHaveBeenCalledWith(otpsServiceCreateOptions)
      expect(mailService.sendOtp).toHaveBeenCalledWith(
        mailServiceSendOtpOptions,
      )
    })

    test('should be return 403 if a user with that email exists', async () => {
      const user = getFakeUser({ ...data })

      usersService.isExist.mockResolvedValue(true)

      const userIsExistOptions: UsersServiceIsExistOptions = {
        where: { email: user.email },
      }

      await expect(authService.signUp(data)).rejects.toThrow(
        new ForbiddenException(),
      )
      expect(usersService.isExist).toHaveBeenCalledWith(userIsExistOptions)
    })
  })

  describe('signIn', () => {
    let data: SignInOptions

    beforeEach(() => {
      const { email } = getFakeUser()
      data = { email }
    })

    test('should be return a user ID and otp ID if a user with that email has exist and user is active', async () => {
      const user = getFakeUser({ ...data, isActive: true })
      const otp = getFakeOtp({ type: OtpType.SIGN_IN, userId: user.id })

      usersService.findOne.mockResolvedValue(user)
      otpsService.create.mockResolvedValue(otp)
      mailService.sendOtp.mockResolvedValue(true)

      const result: LoginReturn = { otpId: otp.id, userId: user.id }
      const usersServiceFindOneOptions: UsersServiceFindOneOptions = {
        where: { email: user.email },
      }
      const otpsServiceCreateOptions: OtpsServiceCreateOptions = {
        type: otp.type,
        userId: user.id,
      }
      const mailServiceSendOtpOptions: MailServiceSendOtpOptions = {
        email: user.email,
        code: otp.code,
        type: otp.type,
      }

      expect(await authService.signIn(data)).toEqual(result)
      expect(usersService.findOne).toHaveBeenCalledWith(
        usersServiceFindOneOptions,
      )
      expect(otpsService.create).toHaveBeenCalledWith(otpsServiceCreateOptions)
      expect(mailService.sendOtp).toHaveBeenCalledWith(
        mailServiceSendOtpOptions,
      )
    })

    test('should be return a null if a user with that email does not exist', async () => {
      const user = getFakeUser({ ...data })
      const usersServiceFindOneOptions: UsersServiceFindOneOptions = {
        where: { email: user.email },
      }

      usersService.findOne.mockResolvedValue(null)

      await expect(authService.signIn(data)).rejects.toThrow(
        new ForbiddenException(),
      )
      expect(usersService.findOne).toHaveBeenCalledWith(
        usersServiceFindOneOptions,
      )
    })

    test('should be return a 403 if a user with that email does not active', async () => {
      const user = getFakeUser({ ...data, isActive: false })
      const usersServiceFindOneOptions: UsersServiceFindOneOptions = {
        where: { email: user.email },
      }

      usersService.findOne.mockResolvedValue(user)

      await expect(authService.signIn(data)).rejects.toThrow(
        new ForbiddenException(),
      )
      expect(usersService.findOne).toHaveBeenCalledWith(
        usersServiceFindOneOptions,
      )
    })
  })

  describe('verifyOtp', () => {
    let user: User
    let body: VerifyOtpOptions

    beforeEach(() => {
      user = getFakeUser()
      body = getFakeOtp({ userId: user.id, type: OtpType.SIGN_UP })
    })

    test('should be set a pair of cookies with JWT if such an OTP exists', async () => {
      const otp = getFakeOtp({ ...body })
      const jwts = getFakeJwts()

      otpsService.verify.mockResolvedValue(true)
      usersService.setActive.mockResolvedValue(user)
      jwtsService.sign.mockResolvedValue(jwts)

      const otpsServiceVerifyOptions: OtpsServiceVerifyOptions = otp
      const usersServiceSetActiveOptions: UsersServiceSetActiveOptions = {
        where: { id: user.id },
        value: true,
      }
      const jwtsServiceSignOptions: JwtsServiceSignOptions = { sub: user.id }

      expect(await authService.verifyOtp(body)).toEqual(jwts)
      expect(otpsService.verify).toHaveBeenCalledWith(otpsServiceVerifyOptions)
      expect(usersService.setActive).toHaveBeenCalledWith(
        usersServiceSetActiveOptions,
      )
      expect(jwtsService.sign).toHaveBeenCalledWith(jwtsServiceSignOptions)
    })

    test('should be return a 404 if a OTP not found', async () => {
      otpsService.verify.mockResolvedValue(false)

      await expect(authService.verifyOtp(body)).rejects.toThrow(
        new NotFoundException(),
      )
      expect(otpsService.verify).toHaveBeenCalledWith(body)
    })
  })

  describe('rotate', () => {
    test('should be set a pair of cookies with JWT', async () => {
      const oldJwts = getFakeJwts()
      const newJwts = getFakeJwts()

      jwtsService.rotate.mockResolvedValue(newJwts)

      const jwtsServiveRotateOptions: JwtsServiceRotateOptions = oldJwts

      expect(await authService.rotate(oldJwts)).toEqual(newJwts)
      expect(jwtsService.rotate).toHaveBeenCalledWith(jwtsServiveRotateOptions)
    })
  })

  describe('logout', () => {
    test('should be remove a pair of cookies with JWT', async () => {
      const jwts = getFakeJwts()

      expect(await authService.logout(jwts)).toBeUndefined()
    })
  })
})
