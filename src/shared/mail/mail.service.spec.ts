import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer'
import { MailService } from './mail.service'
import { mock, MockProxy } from 'vitest-mock-extended'
import { OtpType } from '@/otps/otps.enums'
import { getAlphanumericString, getFakeEmail } from '@/test/utils'
import { SendOtpOptions } from '@/shared/mail/mail.types'

describe('MailService', () => {
  let mailService: MailService
  let mailerService: MockProxy<MailerService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MailService,
          inject: [MailerService],
          useFactory: (mailerService: MailerService) =>
            new MailService(mailerService),
        },
      ],
    })
      .useMocker(mock)
      .compile()

    mailService = module.get(MailService)
    mailerService = module.get(MailerService)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('sendOtp', () => {
    let email: string
    let code: string

    beforeEach(() => {
      email = getFakeEmail()
      code = getAlphanumericString({ length: 6 })
    })

    test('should be send OTP email for SIGN_IN type', async () => {
      const type = OtpType.SIGN_IN
      const options: SendOtpOptions = { email, code, type }
      const mailerServiceSendMailOptions: ISendMailOptions = {
        to: email,
        subject: 'Подтверждение входа',
        html: `<p>Ваш код подтверждения: ${code}</p>`,
      }

      mailerService.sendMail.mockResolvedValue(undefined)

      const result = await mailService.sendOtp(options)

      expect(result).toBe(true)
      expect(mailerService.sendMail).toHaveBeenCalledWith(
        mailerServiceSendMailOptions,
      )
      expect(mailerService.sendMail).toHaveBeenCalledTimes(1)
    })

    test('should be send OTP email for SIGN_UP type', async () => {
      const type = OtpType.SIGN_UP
      const options: SendOtpOptions = { email, code, type }
      const mailerServiceSendMailOptions: ISendMailOptions = {
        to: email,
        subject: 'Подтверждение регистрации',
        html: `<p>Ваш код подтверждения: ${code}</p>`,
      }

      mailerService.sendMail.mockResolvedValue(undefined)

      const result = await mailService.sendOtp(options)

      expect(result).toBe(true)
      expect(mailerService.sendMail).toHaveBeenCalledWith(
        mailerServiceSendMailOptions,
      )
      expect(mailerService.sendMail).toHaveBeenCalledTimes(1)
    })

    test('should be return false when sendMail fails', async () => {
      const type = OtpType.SIGN_IN
      const options: SendOtpOptions = { email, code, type }
      const mailerServiceSendMailOptions: ISendMailOptions = {
        to: email,
        subject: 'Подтверждение входа',
        html: `<p>Ваш код подтверждения: ${code}</p>`,
      }

      mailerService.sendMail.mockRejectedValue(new Error('SMTP error'))

      const result = await mailService.sendOtp(options)

      expect(result).toBe(false)
      expect(mailerService.sendMail).toHaveBeenCalledWith(
        mailerServiceSendMailOptions,
      )
    })
  })
})
