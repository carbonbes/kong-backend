import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { JwtService, TokenExpiredError, JsonWebTokenError } from '@nestjs/jwt'
import { UuidService } from '@/shared/uuid/uuid.service'
import { AccessJwtService } from './access-jwt.service'
import { getFakeInt, getFakeJwt, getFakeUuid } from '@/test/utils'
import { mock, MockProxy } from 'vitest-mock-extended'
import { getDecodedJwt } from '@/shared/utils'
import { EncodedJwt } from '@/shared/types'

describe('AccessJwtService', () => {
  let accessJwtService: AccessJwtService
  let jwtService: MockProxy<JwtService>
  let uuidService: MockProxy<UuidService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AccessJwtService,
          inject: [JwtService, UuidService],
          useFactory: (jwtService: JwtService, uuidService: UuidService) =>
            new AccessJwtService(jwtService, uuidService),
        },
      ],
    })
      .useMocker(mock)
      .compile()

    accessJwtService = module.get(AccessJwtService)
    jwtService = module.get(JwtService)
    uuidService = module.get(UuidService)
  })

  describe('sign', () => {
    test('should be sign access JWT', () => {
      vi.useFakeTimers()
      const currentDate = Date.now() / 1000
      const accessJwtExpiresIn = Number(process.env.ACCESS_JWT_EXPIRES_IN)

      const sub = getFakeInt()
      const jti = getFakeUuid()
      const encodedJwt = getFakeJwt({
        type: 'access_token',
        payload: { jti, sub },
      })

      uuidService.generate.mockReturnValue(jti)
      jwtService.sign.mockReturnValue(encodedJwt)

      const result = accessJwtService.sign({ sub })
      const decodedJwt = getDecodedJwt(result)

      expect(result).toBe(encodedJwt)
      expect(decodedJwt.jti).toBe(jti)
      expect(decodedJwt.sub).toBe(sub)
      expect(decodedJwt.iat).toBe(currentDate)
      expect(decodedJwt.exp).toBe(currentDate + accessJwtExpiresIn)
      expect(uuidService.generate).toHaveBeenCalled()
      expect(jwtService.sign).toHaveBeenCalledWith({ jti, sub })

      vi.useRealTimers()
    })
  })

  describe('verify', () => {
    let encodedJwt: EncodedJwt

    beforeEach(() => {
      encodedJwt = getFakeJwt({ type: 'access_token' })
    })

    test('should be verify valid access JWT and return payload', () => {
      const decodedPayload = getDecodedJwt(encodedJwt)

      jwtService.verify.mockReturnValue(decodedPayload)

      const result = accessJwtService.verify(encodedJwt)

      expect(result).toEqual(decodedPayload)
      expect(jwtService.verify).toHaveBeenCalledWith(encodedJwt)
    })

    test('should be throw JsonWebTokenError when token is invalid', () => {
      jwtService.verify.mockRejectedValue(
        new JsonWebTokenError('Invalid token'),
      )

      expect(accessJwtService.verify(encodedJwt)).rejects.toThrow(
        new JsonWebTokenError('Invalid token'),
      )
      expect(jwtService.verify).toHaveBeenCalledWith(encodedJwt)
    })

    test('should be throw TokenExpiredError when token is expired', () => {
      jwtService.verify.mockRejectedValue(
        new TokenExpiredError('Token expired', new Date()),
      )

      expect(accessJwtService.verify(encodedJwt)).rejects.toThrow(
        new TokenExpiredError('Token expired', new Date()),
      )
      expect(jwtService.verify).toHaveBeenCalledWith(encodedJwt)
    })
  })
})
