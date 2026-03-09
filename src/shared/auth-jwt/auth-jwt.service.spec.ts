import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { UuidService } from '@/shared/uuid/uuid.service'
import { AuthJwtService as AbstractAuthJwtService } from '@/shared/auth-jwt/auth-jwt.service'
import { SignOptions } from '@/shared/auth-jwt/types'
import { getFakeEmail, getFakeJwt, getFakeUuid } from '@/test/utils'
import { mock, MockProxy } from 'vitest-mock-extended'
import { getDecodedJwt } from '@/shared/utils'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { JWT_CREATED } from '@/shared/auth-jwt/consts'
import { JwtCreatedEvent } from '@/shared/auth-jwt/events/jwt-created.event'

class AuthJwtService extends AbstractAuthJwtService {
  constructor(
    jwtService: JwtService,
    uuidService: UuidService,
    eventEmitter: EventEmitter2,
  ) {
    super(jwtService, uuidService, eventEmitter)
  }
}

describe('AuthJwtService', () => {
  let authJwtService: AuthJwtService
  let jwtService: MockProxy<JwtService>
  let uuidService: MockProxy<UuidService>
  let eventEmitter: MockProxy<EventEmitter2>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthJwtService,
          useFactory: (
            jwtService: JwtService,
            uuidService: UuidService,
            eventEmitter: EventEmitter2,
          ) => new AuthJwtService(jwtService, uuidService, eventEmitter),
          inject: [JwtService, UuidService, EventEmitter2],
        },
      ],
    })
      .useMocker(mock)
      .compile()

    authJwtService = module.get<AuthJwtService>(AuthJwtService)
    jwtService = module.get<MockProxy<JwtService>>(JwtService)
    uuidService = module.get<MockProxy<UuidService>>(UuidService)
    eventEmitter = module.get<MockProxy<EventEmitter2>>(EventEmitter2)
  })

  describe('sign', () => {
    test('should be sign JWT', () => {
      vi.useFakeTimers()
      const currentDate = Date.now() / 1000

      const { sub }: SignOptions = { sub: getFakeEmail() }

      const jti = getFakeUuid()
      const encodedJwt = getFakeJwt({ payload: { jti, sub } })

      uuidService.generate.mockReturnValue(jti)
      jwtService.sign.mockReturnValue(encodedJwt)

      const result = authJwtService.sign({ sub })
      const decodedJwt = getDecodedJwt(result)

      expect(result).toBe(encodedJwt)
      expect(decodedJwt.jti).toBe(jti)
      expect(decodedJwt.sub).toBe(sub)
      expect(decodedJwt.exp).toBeDefined()
      expect(decodedJwt.iat).toBe(currentDate)
      expect(uuidService.generate).toHaveBeenCalled()
      expect(jwtService.sign).toHaveBeenCalledWith({ jti, sub })
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        JWT_CREATED,
        new JwtCreatedEvent(encodedJwt),
      )

      vi.useRealTimers()
    })
  })
})
