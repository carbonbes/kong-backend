import { vi } from 'vitest'
import { Search, WhereField, Entity } from 'redis-om'

/**
 * Mock type that combines Search and WhereField for the fluent API
 * This represents the chainable interface returned by repository.search()
 */
type MockRedisSearchBuilder<T extends Entity = Record<string, any>> =
  Search<T> & WhereField<T>

/**
 * Options for creating a mock Redis search builder
 */
type CreateMockRedisSearchOptions<T> = {
  returnValue?: T | null | T[]
  returnFirstValue?: T | null
  returnAllValue?: T[]
}

/**
 * Creates a mock search builder for redis-om Repository.search()
 *
 * @example
 * // For single result queries
 * const builder = createMockRedisSearch<Otp>({ returnFirstValue: fakeOtp })
 * repository.search.mockReturnValue(builder)
 *
 * @example
 * // For multiple results
 * const builder = createMockRedisSearch<Jwt>({ returnAllValue: [jwt1, jwt2] })
 * repository.search.mockReturnValue(builder)
 *
 * @example
 * // For null results
 * const builder = createMockRedisSearch<Otp>({ returnFirstValue: null })
 * repository.search.mockReturnValue(builder)
 */
export function createMockRedisSearch<T extends Entity>(
  options: CreateMockRedisSearchOptions<T> = {},
): MockRedisSearchBuilder<T> {
  const builder: MockRedisSearchBuilder<T> = {
    where: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    and: vi.fn().mockReturnThis(),
    returnFirst: vi
      .fn()
      .mockResolvedValue(
        options.returnFirstValue !== undefined
          ? options.returnFirstValue
          : Array.isArray(options.returnValue)
            ? null
            : options.returnValue,
      ),
    returnAll: vi
      .fn()
      .mockResolvedValue(
        options.returnAllValue !== undefined
          ? options.returnAllValue
          : Array.isArray(options.returnValue)
            ? options.returnValue
            : [],
      ),
  } as unknown as MockRedisSearchBuilder<T>

  return builder
}
