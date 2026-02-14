import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { UuidService } from '@/shared/uuid/uuid.service'
import { RefreshJwtService } from './refresh-jwt.service'
import { getFakeInt, getFakeJwt, getFakeUuid } from '@/test/utils'
import { mock, MockProxy } from 'vitest-mock-extended'
import { getDecodedJwt } from '@/shared/utils'
import { UnauthorizedException } from '@nestjs/common'

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

    refreshJwtService = module.get(RefreshJwtService)
    jwtService = module.get(JwtService)
    uuidService = module.get(UuidService)
  })

  describe('sign', () => {
    test('should be sign refresh JWT', () => {
      vi.useFakeTimers()
      const currentDate = Date.now() / 1000
      const refreshJwtExpiresIn = Number(process.env.REFRESH_JWT_EXPIRES_IN)

      const sub = getFakeInt()
      const jti = getFakeUuid()
      const encodedJwt = getFakeJwt({
        type: 'refresh_token',
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
    test('should be verify valid refresh JWT and return payload', () => {
      const encodedJwt = getFakeJwt({ type: 'refresh_token' })
      const decodedPayload = getDecodedJwt(encodedJwt)

      jwtService.verify.mockReturnValue(decodedPayload)

      const result = refreshJwtService.verify(encodedJwt)

      expect(result).toEqual(decodedPayload)
      expect(jwtService.verify).toHaveBeenCalledWith(encodedJwt)
    })

    test('should be throw UnauthorizedException when token is invalid', () => {
      const encodedJwt = getFakeJwt({ type: 'refresh_token' })

      jwtService.verify.mockImplementation(() => {
        throw new UnauthorizedException()
      })

      expect(() => refreshJwtService.verify(encodedJwt)).toThrow(
        UnauthorizedException,
      )
      expect(jwtService.verify).toHaveBeenCalledWith(encodedJwt)
    })

    test('should be throw UnauthorizedException when token is expired', () => {
      const encodedJwt = getFakeJwt({ type: 'refresh_token' })

      jwtService.verify.mockImplementation(() => {
        throw new UnauthorizedException('Token expired')
      })

      expect(() => refreshJwtService.verify(encodedJwt)).toThrow(
        UnauthorizedException,
      )
      expect(jwtService.verify).toHaveBeenCalledWith(encodedJwt)
    })
  })
})
