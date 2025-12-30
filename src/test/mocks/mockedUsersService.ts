import { UsersService } from '@/users/users.service'
import { vi } from 'vitest'
import { PublicMethods } from '@/shared/types'

export const mockedUsersService: PublicMethods<UsersService> = {
  create: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  isExist: vi.fn(),
  setActive: vi.fn(),
}
