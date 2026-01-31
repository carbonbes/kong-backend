import { describe, expect, test } from 'vitest'
import { getDecodedJwt } from './getDecodedJwt'
import { getFakeJwt, getFakeUuid } from '@/test/utils'
import { JwtPayload } from '@/shared/types'

describe('getDecodedJwt', () => {
  test('should be decode a valid JWT and return payload', () => {
    const payload: JwtPayload = {
      jti: getFakeUuid(),
      sub: 123,
      iat: 1700000000,
      exp: 1700003600,
    }
    const jwt = getFakeJwt({ payload })

    const result = getDecodedJwt(jwt)

    expect(result).toMatchObject(payload)
  })

  test('should be return correct payload structure', () => {
    const jwt = getFakeJwt()

    const result = getDecodedJwt(jwt)

    expect(result).toHaveProperty('jti')
    expect(result).toHaveProperty('sub')
    expect(result).toHaveProperty('iat')
    expect(result).toHaveProperty('exp')
  })
})
