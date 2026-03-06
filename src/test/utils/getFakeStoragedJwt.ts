import { StoragedJwt } from '@/shared/jwt-storage/types'
import { getFakeUuid } from '@/test/utils/getFakeUuid'
import { faker } from '@faker-js/faker/locale/ru'

type GetFakeJwtOptions = Partial<StoragedJwt>

export const getFakeStoragedJwt = ({
  jti,
  sub,
}: GetFakeJwtOptions = {}): StoragedJwt => ({
  jti: jti ?? getFakeUuid(),
  sub: sub ?? faker.internet.email(),
})
