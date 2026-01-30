import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { UuidService } from '@/shared/uuid/uuid.service'
import { AuthJwtService as AbstractAuthJwtService } from '@/shared/auth-jwt/auth-jwt.service'
import { SignOptions } from '@/shared/auth-jwt/auth-jwt.types'
import { getFakeInt, getFakeJwt, getFakeUuid } from '@/test/utils'
import { mock, MockProxy } from 'vitest-mock-extended'
import getDecodedJwt from '@/shared/utils/getDecodedJwt'

class AuthJwtService extends AbstractAuthJwtService {
  constructor(jwtService: JwtService, uuidService: UuidService) {
    super(jwtService, uuidService)
  }
}

describe('AuthJwtService', () => {
  let authJwtService: AuthJwtService
  let jwtService: MockProxy<JwtService>
  let uuidService: MockProxy<UuidService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthJwtService,
          inject: [JwtService, UuidService],
          useFactory: (jwtService: JwtService, uuidService: UuidService) =>
            new AuthJwtService(jwtService, uuidService),
        },
      ],
    })
      .useMocker(mock)
      .compile()

    authJwtService = module.get(AuthJwtService)
    jwtService = module.get(JwtService)
    uuidService = module.get(UuidService)

    vi.clearAllMocks()
  })

  describe('sign', () => {
    test('should be sign JWT with jti and sub', () => {
      const { sub }: SignOptions = { sub: getFakeInt() }

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
      expect(decodedJwt.iat).toBeDefined()
      expect(uuidService.generate).toHaveBeenCalled()
      expect(jwtService.sign).toHaveBeenCalledWith({ jti, sub })
    })
  })
})
