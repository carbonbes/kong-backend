import { Test, TestingModule } from '@nestjs/testing'
import { JwtService, TokenExpiredError, JsonWebTokenError } from '@nestjs/jwt'
import { UuidService } from '@/shared/uuid/uuid.service'
import { RefreshJwtService } from './refresh-jwt.service'
import { getFakeEmail, getFakeInt, getFakeJwt, getFakeUuid } from '@/test/utils'
import { mock, MockProxy } from 'vitest-mock-extended'
import { getDecodedJwt } from '@/shared/utils'
import { EncodedJwt } from '@/shared/types'

describe('RefreshJwtService', () => {
  let refreshJwtService: RefreshJwtService
  let jwtService: MockProxy<JwtService>
  let uuidService: MockProxy<UuidService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RefreshJwtService,
          inject: [JwtService, UuidService],
          useFactory: (jwtService: JwtService, uuidService: UuidService) =>
            new RefreshJwtService(jwtService, uuidService),
        },
      ],
    })
      .useMocker(mock)
      .compile()

    refreshJwtService = module.get<RefreshJwtService>(RefreshJwtService)
    jwtService = module.get<MockProxy<JwtService>>(JwtService)
    uuidService = module.get<MockProxy<UuidService>>(UuidService)
  })

  describe('sign', () => {
    test('should be sign refresh JWT', () => {
      vi.useFakeTimers()
      const currentDate = Date.now() / 1000
      const refreshJwtExpiresIn = 2592000

      const sub = getFakeEmail()
      const jti = getFakeUuid()
      const encodedJwt = getFakeJwt({
        type: 'refreshToken',
        payload: { jti, sub },
      })

      uuidService.generate.mockReturnValue(jti)
      jwtService.sign.mockReturnValue(encodedJwt)

      const result = refreshJwtService.sign({ sub })
      const decodedJwt = getDecodedJwt(result)

      expect(result).toBe(encodedJwt)
      expect(decodedJwt.jti).toBe(jti)
      expect(decodedJwt.sub).toBe(sub)
      expect(decodedJwt.iat).toBe(currentDate)
      expect(decodedJwt.exp).toBe(currentDate + refreshJwtExpiresIn)
      expect(uuidService.generate).toHaveBeenCalled()
      expect(jwtService.sign).toHaveBeenCalledWith({ jti, sub })

      vi.useRealTimers()
    })
  })

  describe('verify', () => {
    let encodedJwt: EncodedJwt

    beforeEach(() => {
      encodedJwt = getFakeJwt({ type: 'refreshToken' })
    })

    test('should be verify valid refresh JWT and return payload', () => {
      const decodedPayload = getDecodedJwt(encodedJwt)

      jwtService.verify.mockReturnValue(decodedPayload)

      const result = refreshJwtService.verify(encodedJwt)

      expect(result).toEqual(decodedPayload)
      expect(jwtService.verify).toHaveBeenCalledWith(encodedJwt)
    })

    test('should be throw JsonWebTokenError when token is invalid', async () => {
      jwtService.verify.mockRejectedValue(
        new JsonWebTokenError('Invalid token'),
      )

      await expect(refreshJwtService.verify(encodedJwt)).rejects.toThrow(
        new JsonWebTokenError('Invalid token'),
      )
      expect(jwtService.verify).toHaveBeenCalledWith(encodedJwt)
    })

    test('should be throw TokenExpiredError when token is expired', async () => {
      jwtService.verify.mockRejectedValue(
        new TokenExpiredError('Token expired', new Date()),
      )

      await expect(refreshJwtService.verify(encodedJwt)).rejects.toThrow(
        new TokenExpiredError('Token expired', new Date()),
      )
      expect(jwtService.verify).toHaveBeenCalledWith(encodedJwt)
    })
  })
})
