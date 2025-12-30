import { JwtsService } from '@/jwts/jwts.service'
import { vi } from 'vitest'
import { PublicMethods } from '@/shared/types'

export const mockedJwtsService: PublicMethods<JwtsService> = {
  sign: vi.fn(),
  revoke: vi.fn(),
  isRevoked: vi.fn(),
  rotate: vi.fn(),
  decode: vi.fn(),
}
