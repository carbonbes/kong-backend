import { vi } from 'vitest'

export type MockRepository<T> = {
  [P in keyof T]: ReturnType<typeof vi.fn>
}
