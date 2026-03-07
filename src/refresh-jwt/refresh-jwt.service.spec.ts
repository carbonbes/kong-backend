import { Test, TestingModule } from '@nestjs/testing'
import { JwtService, TokenExpiredError, JsonWebTokenError } from '@nestjs/jwt'
import { UuidService } from '@/shared/uuid/uuid.service'
import { RefreshJwtService } from './refresh-jwt.service'
import { getFakeEmail, getFakeJwt, getFakeUuid } from '@/test/utils'
import { mock, MockProxy } from 'vitest-mock-extended'
import { getDecodedJwt } from '@/shared/utils'
import { EncodedJwt } from '@/shared/types'
import { REFRESH_TOKEN_NAME } from '@/shared/consts'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { JWT_CREATED } from '@/events/jwt-created/consts'
import { JwtCreatedEvent } from '@/events/jwt-created/jwt-created.event'

describe('RefreshJwtService', () => {
  let refreshJwtService: RefreshJwtService
  let jwtService: MockProxy<JwtService>
  let uuidService: MockProxy<UuidService>
  let eventEmitter: MockProxy<EventEmitter2>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RefreshJwtService,
          useFactory: (
            jwtService: JwtService,
            uuidService: UuidService,
            eventEmitter: EventEmitter2,
          ) => new RefreshJwtService(jwtService, uuidService, eventEmitter),
          inject: [JwtService, UuidService, EventEmitter2],
        },
      ],
    })
      .useMocker(mock)
      .compile()

    refreshJwtService = module.get<RefreshJwtService>(RefreshJwtService)
    jwtService = module.get<MockProxy<JwtService>>(JwtService)
    uuidService = module.get<MockProxy<UuidService>>(UuidService)
    eventEmitter = module.get<MockProxy<EventEmitter2>>(EventEmitter2)
  })

  describe('sign', () => {
    test('should be sign refresh JWT', () => {
      vi.useFakeTimers()
      const currentDate = Date.now() / 1000
      const refreshJwtExpiresIn = 2592000

      const sub = getFakeEmail()
      const jti = getFakeUuid()
      const encodedJwt = getFakeJwt({
        type: REFRESH_TOKEN_NAME,
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
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        JWT_CREATED,
        new JwtCreatedEvent(encodedJwt),
      )

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
