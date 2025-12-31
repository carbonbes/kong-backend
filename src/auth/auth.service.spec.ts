import { beforeEach, describe, expect, test, vi } from 'vitest'
import { AuthService } from '@/auth/auth.service'
import { Test, TestingModule } from '@nestjs/testing'
import {
  mockedJwtsService,
  mockedMailService,
  mockedOtpsService,
  mockedUsersService,
} from '@/test/mocks'
import { UsersService } from '@/users/users.service'
import { MailService } from '@/mail/mail.service'
import { OtpsService } from '@/otps/otps.service'
import { JwtsService } from '@/jwts/jwts.service'
import { createFakeOtp, createFakeUser } from '@/test/utils'
import { OtpType } from '@/otps/otps.enums'
import { LoginReturn, SignInOptions, SignUpOptions } from '@/auth/auth.types'

describe('AuthService', () => {
  let service: AuthService
  const usersService = mockedUsersService
  const mailService = mockedMailService
  const otpsService = mockedOtpsService
  const jwtsService = mockedJwtsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: MailService, useValue: mailService },
        { provide: OtpsService, useValue: otpsService },
        { provide: JwtsService, useValue: jwtsService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  describe('signUp', () => {
    const { email, name, gender } = createFakeUser()
    const data: SignUpOptions = { email, name, gender }

    test('should return a user ID and otp ID if a user with that email not exist', async () => {
      const user = createFakeUser()
      const otp = createFakeOtp({ type: OtpType.SIGN_UP, userId: user.id })

      vi.spyOn(usersService, 'isExist').mockResolvedValue(false)
      vi.spyOn(usersService, 'create').mockResolvedValue(user)
      vi.spyOn(otpsService, 'create').mockResolvedValue(otp)
      vi.spyOn(mailService, 'sendOtp').mockResolvedValue(true)

      const serviceSpy = vi.spyOn(service, 'signUp')

      const result: LoginReturn = { otpId: otp.id, userId: user.id }

      expect(await service.signUp(data)).toEqual(result)
      expect(serviceSpy).toHaveBeenCalledWith(data)
    })

    test('should return null if a user with that email exists', async () => {
      vi.spyOn(usersService, 'isExist').mockResolvedValue(true)

      const result = null

      expect(await service.signUp(data)).toBe(result)
    })
  })

  describe('signIn', () => {
    const { email } = createFakeUser()
    const data: SignInOptions = { email }

    test('should return a user ID and otp ID if a user with that email has exist and user is active', async () => {
      const user = createFakeUser({ isActive: true })
      const otp = createFakeOtp({ type: OtpType.SIGN_UP, userId: user.id })

      vi.spyOn(usersService, 'findOne').mockResolvedValue(user)
      vi.spyOn(otpsService, 'create').mockResolvedValue(otp)
      vi.spyOn(mailService, 'sendOtp').mockResolvedValue(true)

      const serviceSpy = vi.spyOn(service, 'signIn')

      const result: LoginReturn = { otpId: otp.id, userId: user.id }

      expect(await service.signIn(data)).toEqual(result)
      expect(serviceSpy).toHaveBeenCalledWith(data)
    })
  })
})
