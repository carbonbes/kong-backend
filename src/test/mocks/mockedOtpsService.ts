import { OtpsService } from '@/otps/otps.service'
import { vi } from 'vitest'
import { PublicMethods } from '@/shared/types'

export const mockedOtpsService: PublicMethods<OtpsService> = {
  create: vi.fn(),
  verify: vi.fn(),
}
