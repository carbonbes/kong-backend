import { EncodedJwt, JwtHeader, JwtPayload } from '@/shared/types'
import { AuthJwts } from '@/auth-jwts/types'
import { Uuid } from '@/shared/uuid/types'
import { faker } from '@faker-js/faker/locale/ru'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/shared/consts'

type FakeJwtHeader = JwtHeader
type FakeJwtPayload = JwtPayload
type FakeJwtType = typeof ACCESS_TOKEN_NAME | typeof REFRESH_TOKEN_NAME

type GetFakeJwtOptions = {
  header?: Partial<FakeJwtHeader>
  payload?: Partial<FakeJwtPayload>
  type?: FakeJwtType
}

type GetFakeJwtsOptions = {
  accessJwtOptions?: Omit<GetFakeJwtOptions, 'type'>
  refreshJwtOptions?: Omit<GetFakeJwtOptions, 'type'>
}

export const getFakeJwt = (options: GetFakeJwtOptions = {}): EncodedJwt => {
  const accessJwtExp = Number(process.env.ACCESS_JWT_EXPIRES_IN)
  const refreshJwtExp = Number(process.env.REFRESH_JWT_EXPIRES_IN)
  const jwtType: FakeJwtType = options.type ?? ACCESS_TOKEN_NAME

  const currentTime = Date.now() / 1000

  const header: JwtHeader = {
    alg: options.header?.alg ?? 'HS256',
    typ: options.header?.typ ?? 'JWT',
  }

  const payload: JwtPayload = {
    jti: options.payload?.jti ?? (faker.string.uuid() as Uuid),
    sub: options.payload?.sub ?? faker.internet.email(),
    iat: options.payload?.iat ?? currentTime,
    exp:
      options.payload?.exp ??
      currentTime +
        (jwtType === ACCESS_TOKEN_NAME ? accessJwtExp : refreshJwtExp),
  }

  return faker.internet.jwt({ header, payload }) as EncodedJwt
}

export const getFakeAuthJwts = (options: GetFakeJwtsOptions = {}): AuthJwts => {
  const { accessJwtOptions, refreshJwtOptions } = options

  return {
    [ACCESS_TOKEN_NAME]: getFakeJwt({
      type: ACCESS_TOKEN_NAME,
      ...accessJwtOptions,
    }),
    [REFRESH_TOKEN_NAME]: getFakeJwt({
      type: REFRESH_TOKEN_NAME,
      ...refreshJwtOptions,
    }),
  }
}
