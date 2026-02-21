import { StoragedJwt } from '@/shared/jwt-storage/jwt-storage.types'
import { getFakeUuid } from '@/test/utils/getFakeUuid'
import { getFakeInt } from '@/test/utils/getFakeInt'

type GetFakeJwtOptions = Partial<StoragedJwt>

export const getFakeStoragedJwt = ({
  jti,
  sub,
}: GetFakeJwtOptions = {}): StoragedJwt => ({
  jti: jti ?? getFakeUuid(),
  sub: sub ?? getFakeInt(),
})
