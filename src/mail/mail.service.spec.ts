import { Test, TestingModule } from '@nestjs/testing'
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer'
import { MailService } from './mail.service'
import { mock, MockProxy } from 'vitest-mock-extended'
import { OtpType } from '@/otps/enums'
import { getAlphanumericString, getFakeEmail } from '@/test/utils'
import { SendOtpOptions } from '@/mail/types'

describe('MailService', () => {
  let mailService: MailService
  let mailerService: MockProxy<MailerService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    })
      .useMocker(mock)
      .compile()

    mailService = module.get<MailService>(MailService)
    mailerService = module.get<MockProxy<MailerService>>(MailerService)
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

      expect(result).toBe(undefined)
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

      expect(result).toBe(undefined)
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

      await expect(mailService.sendOtp(options)).rejects.toThrow(
        new Error('SMTP error'),
      )
      expect(mailerService.sendMail).toHaveBeenCalledWith(
        mailerServiceSendMailOptions,
      )
    })
  })
})
