import { Test, TestingModule } from '@nestjs/testing'
import { AuthJwtsService } from './auth-jwts.service'
import { RevokeOptions, RotateOptions, SignOptions } from '@/auth-jwts/types'
import { getFakeEmail, getFakeJwt } from '@/test/utils'
import { mock, MockProxy } from 'vitest-mock-extended'
import { AccessJwtService } from '@/access-jwt/access-jwt.service'
import { RefreshJwtService } from '@/refresh-jwt/refresh-jwt.service'
import { RevokedJwtsService } from '@/revoked-jwts/revoked-jwts.service'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/shared/consts'
import { getDecodedJwt } from '@/shared/utils'

describe('AuthJwtsService', () => {
  let authJwtsService: AuthJwtsService
  let accessJwtService: MockProxy<AccessJwtService>
  let refreshJwtService: MockProxy<RefreshJwtService>
  let revokedJwtsService: MockProxy<RevokedJwtsService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthJwtsService],
    })
      .useMocker(mock)
      .compile()

    authJwtsService = module.get<AuthJwtsService>(AuthJwtsService)
    accessJwtService = module.get<MockProxy<AccessJwtService>>(AccessJwtService)
    refreshJwtService =
      module.get<MockProxy<RefreshJwtService>>(RefreshJwtService)
    revokedJwtsService =
      module.get<MockProxy<RevokedJwtsService>>(RevokedJwtsService)
  })

  describe('sign', () => {
    test('should be sign and return auth-jwts', () => {
      const options: SignOptions = { sub: getFakeEmail() }
      const accessJwt = getFakeJwt({ payload: { sub: options.sub } })
      const refreshJwt = getFakeJwt({ payload: { sub: options.sub } })

      accessJwtService.sign.mockReturnValue(accessJwt)
      refreshJwtService.sign.mockReturnValue(refreshJwt)

      const result = authJwtsService.sign(options)

      expect(result).toEqual({
        [ACCESS_TOKEN_NAME]: accessJwt,
        [REFRESH_TOKEN_NAME]: refreshJwt,
      })
      expect(accessJwtService.sign).toHaveBeenCalledWith({ sub: options.sub })
      expect(refreshJwtService.sign).toHaveBeenCalledWith({ sub: options.sub })
    })
  })

  describe('revoke', () => {
    test('should be revoke jwt', async () => {
      const options: RevokeOptions = getFakeJwt()
      const decodedJwt = getDecodedJwt(options)

      refreshJwtService.verify.mockReturnValue(decodedJwt)

      const result = await authJwtsService.revoke(options)

      expect(result).toBeUndefined()
      expect(refreshJwtService.verify).toHaveBeenCalledWith(options)
      expect(revokedJwtsService.add).toHaveBeenCalledWith({
        jti: decodedJwt.jti,
        sub: decodedJwt.sub,
        exp: decodedJwt.exp,
      })
    })
  })

  describe('rotate', () => {
    test('should be revoke old refresh-jwt and return new auth-jwts', async () => {
      const options: RotateOptions = getFakeJwt()
      const decodedJwt = getDecodedJwt(options)
      const accessJwt = getFakeJwt({ payload: { sub: decodedJwt.sub } })
      const refreshJwt = getFakeJwt({ payload: { sub: decodedJwt.sub } })

      refreshJwtService.verify.mockReturnValue(decodedJwt)
      refreshJwtService.decode.mockReturnValue(decodedJwt)
      accessJwtService.sign.mockReturnValue(accessJwt)
      refreshJwtService.sign.mockReturnValue(refreshJwt)

      const result = await authJwtsService.rotate(options)

      expect(result).toEqual({
        [ACCESS_TOKEN_NAME]: accessJwt,
        [REFRESH_TOKEN_NAME]: refreshJwt,
      })
      expect(refreshJwtService.verify).toHaveBeenCalledWith(options)
      expect(refreshJwtService.decode).toHaveBeenCalledWith(options)
      expect(revokedJwtsService.add).toHaveBeenCalledWith({
        jti: decodedJwt.jti,
        sub: decodedJwt.sub,
        exp: decodedJwt.exp,
      })
      expect(accessJwtService.sign).toHaveBeenCalledWith({
        sub: decodedJwt.sub,
      })
      expect(refreshJwtService.sign).toHaveBeenCalledWith({
        sub: decodedJwt.sub,
      })
    })
  })
})
