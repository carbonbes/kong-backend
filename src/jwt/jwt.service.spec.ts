import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from './jwt.service'
import { AccessJwtService } from '@/access-jwt/access-jwt.service'
import { RefreshJwtService } from '@/refresh-jwt/refresh-jwt.service'
import { SignedJwtsService } from '@/signed-jwts/signed-jwts.service'
import { RevokedJwtsService } from '@/revoked-jwts/revoked-jwts.service'
import { mock, MockProxy } from 'vitest-mock-extended'
import { getFakeInt, getFakeJwt, getFakeJwts } from '@/test/utils'
import { getDecodedJwt } from '@/shared/utils'

describe('JwtsService', () => {
  let jwtService: JwtService
  let accessJwtService: MockProxy<AccessJwtService>
  let refreshJwtService: MockProxy<RefreshJwtService>
  let signedJwtsService: MockProxy<SignedJwtsService>
  let revokedJwtsService: MockProxy<RevokedJwtsService>

  beforeEach(async () => {
    vi.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtService],
    })
      .useMocker(mock)
      .compile()

    jwtService = module.get(JwtService)
    accessJwtService = module.get(AccessJwtService)
    refreshJwtService = module.get(RefreshJwtService)
    signedJwtsService = module.get(SignedJwtsService)
    revokedJwtsService = module.get(RevokedJwtsService)
  })

  describe('sign', () => {
    test('should be sign JWTs and store them', async () => {
      const sub = getFakeInt()
      const accessToken = getFakeJwt({ type: 'access_token', payload: { sub } })
      const refreshToken = getFakeJwt({
        type: 'refresh_token',
        payload: { sub },
      })
      const accessPayload = getDecodedJwt(accessToken)
      const refreshPayload = getDecodedJwt(refreshToken)

      accessJwtService.sign.mockReturnValue(accessToken)
      refreshJwtService.sign.mockReturnValue(refreshToken)
      signedJwtsService.add.mockResolvedValue({
        jti: accessPayload.jti,
        sub: accessPayload.sub,
      })

      const result = await jwtService.sign({ sub })

      expect(result).toEqual({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      expect(accessJwtService.sign).toHaveBeenCalledWith({ sub })
      expect(refreshJwtService.sign).toHaveBeenCalledWith({ sub })
      expect(signedJwtsService.add).toHaveBeenCalledTimes(2)
      expect(signedJwtsService.add).toHaveBeenCalledWith({
        jti: accessPayload.jti,
        sub: accessPayload.sub,
        exp: accessPayload.exp,
      })
      expect(signedJwtsService.add).toHaveBeenCalledWith({
        jti: refreshPayload.jti,
        sub: refreshPayload.sub,
        exp: refreshPayload.exp,
      })
    })
  })

  describe('revoke', () => {
    test('should be revoke JWT by adding it to revoked list', async () => {
      const jwt = getFakeJwt()
      const payload = getDecodedJwt(jwt)

      revokedJwtsService.add.mockResolvedValue({
        jti: payload.jti,
        sub: payload.sub,
      })

      await jwtService.revoke({ jwt })

      expect(revokedJwtsService.add).toHaveBeenCalledWith({
        jti: payload.jti,
        sub: payload.sub,
        exp: payload.exp,
      })
    })
  })

  describe('isRevoked', () => {
    test('should be return true when JWT is revoked', async () => {
      const jwt = getFakeJwt()
      const { jti } = getDecodedJwt(jwt)

      revokedJwtsService.has.mockResolvedValue(true)

      const result = await jwtService.isRevoked({ jti })

      expect(result).toBe(true)
      expect(revokedJwtsService.has).toHaveBeenCalledWith({ jti })
    })

    test('should be return false when JWT is not revoked', async () => {
      const jwt = getFakeJwt()
      const { jti } = getDecodedJwt(jwt)

      revokedJwtsService.has.mockResolvedValue(false)

      const result = await jwtService.isRevoked({ jti })

      expect(result).toBe(false)
      expect(revokedJwtsService.has).toHaveBeenCalledWith({ jti })
    })
  })

  describe('rotate', () => {
    test('should be rotate JWTs by revoking old and signing new ones', async () => {
      const sub = getFakeInt()
      const oldJwts = getFakeJwts({
        accessJwtOptions: { payload: { sub } },
        refreshJwtOptions: { payload: { sub } },
      })
      const oldAccessPayload = getDecodedJwt(oldJwts.access_token)
      const oldRefreshPayload = getDecodedJwt(oldJwts.refresh_token)
      const newAccessToken = getFakeJwt({
        type: 'access_token',
        payload: { sub },
      })
      const newRefreshToken = getFakeJwt({
        type: 'refresh_token',
        payload: { sub },
      })
      const newAccessPayload = getDecodedJwt(newAccessToken)

      revokedJwtsService.add.mockResolvedValue({
        jti: oldAccessPayload.jti,
        sub: oldAccessPayload.sub,
      })
      accessJwtService.sign.mockReturnValue(newAccessToken)
      refreshJwtService.sign.mockReturnValue(newRefreshToken)
      signedJwtsService.add.mockResolvedValue({
        jti: newAccessPayload.jti,
        sub: newAccessPayload.sub,
      })

      const result = await jwtService.rotate(oldJwts)

      expect(revokedJwtsService.add).toHaveBeenCalledTimes(2)
      expect(revokedJwtsService.add).toHaveBeenCalledWith({
        jti: oldAccessPayload.jti,
        sub: oldAccessPayload.sub,
        exp: oldAccessPayload.exp,
      })
      expect(revokedJwtsService.add).toHaveBeenCalledWith({
        jti: oldRefreshPayload.jti,
        sub: oldRefreshPayload.sub,
        exp: oldRefreshPayload.exp,
      })
      expect(result).toEqual({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      })
      expect(signedJwtsService.add).toHaveBeenCalledTimes(2)
    })
  })

  describe('verify', () => {
    test('should be verify JWT and return payload', () => {
      const jwt = getFakeJwt()
      const expectedPayload = getDecodedJwt(jwt)

      const result = jwtService.verify({ jwt })

      expect(result).toEqual(expectedPayload)
    })
  })
})
