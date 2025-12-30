import { MailService } from '@/mail/mail.service'
import { vi } from 'vitest'
import { PublicMethods } from '@/shared/types'

export const mockedMailService: PublicMethods<MailService> = {
  sendOtp: vi.fn(),
}
