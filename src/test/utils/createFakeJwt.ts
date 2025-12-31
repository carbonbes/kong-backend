import { EncodedJwt, JwtHeader, JwtPayload, Uuid } from '@/shared/types'
import { faker } from '@faker-js/faker/locale/ru'

type FakeJwtType = 'access_token' | 'refresh_token'
type FakeJwtHeader = JwtHeader
type FakeJwtPayload = JwtPayload

type CreateFakeJwtOptions = {
  header?: FakeJwtHeader
  payload?: FakeJwtPayload
  type?: FakeJwtType
}

export const createFakeJwt = (
  options: CreateFakeJwtOptions = {},
): EncodedJwt => {
  const accessJwtExp = Number(process.env.ACCESS_JWT_EXPIRES_IN)
  const refreshJwtExp = Number(process.env.REFRESH_JWT_EXPIRES_IN)
  const jwtType = options.type ?? 'access_token'

  const currentTime = Date.now() / 1000

  const header: JwtHeader = {
    alg: options.header?.alg ?? 'HS256',
    typ: options.header?.typ ?? 'JWT',
  }

  const payload: JwtPayload = {
    jti: options.payload?.jti ?? (faker.string.uuid() as Uuid),
    sub: options.payload?.sub ?? faker.number.int(),
    iat: options.payload?.iat ?? currentTime,
    exp:
      options.payload?.exp ??
      currentTime + (jwtType === 'access_token' ? accessJwtExp : refreshJwtExp),
  }

  return faker.internet.jwt({ header, payload }) as EncodedJwt
}
