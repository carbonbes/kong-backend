import { createClient } from 'redis'
import { Entity, EntityId, RedisConnection, Repository, Schema } from 'redis-om'
import { otpSchema } from '@/otps/schemas'
import { signedJwtSchema } from '@/signed-jwts/schemas'
import { revokedJwtSchema } from '@/revoked-jwts/schemas'
import { USER_EXIST_AND_ACTIVE, USER_EXIST_AND_NOT_ACTIVE } from '@/test/consts'
import { OtpType } from '@/otps/enums'
import { OtpSchema } from '@/otps/types'
import { StoragedJwtSchema } from '@/shared/jwt-storage/types'

const url = process.env.REDIS_URL!
const redis = createClient({ url })

const createRepository = <T extends Entity>(
  schema: Schema,
  client: typeof redis,
) =>
  new Repository(schema, client as unknown as RedisConnection) as Repository<T>

async function main() {
  await redis.connect()

  const otpsRepository = createRepository<OtpSchema>(otpSchema, redis)
  await otpsRepository.createIndex()

  const otp1 = await otpsRepository.save({
    code: '81ca0755f40353329b508419b3d13067e171b0c787948c1df31da2fc7d6e0411934613ecb3c5676793bda691559fa48f59bced14c2cece59f8b9b92cfcb966f2',
    type: OtpType.SIGN_UP,
    email: USER_EXIST_AND_NOT_ACTIVE,
  })
  const entityId = otp1[EntityId]!
  const expiresAt = new Date(Date.now() + 300 * 1000)
  await this.otpsRepository.expireAt(entityId, expiresAt)

  const otp2 = await otpsRepository.save({
    code: '81ca0755f40353329b508419b3d13067e171b0c787948c1df31da2fc7d6e0411934613ecb3c5676793bda691559fa48f59bced14c2cece59f8b9b92cfcb966f2',
    type: OtpType.SIGN_IN,
    email: USER_EXIST_AND_ACTIVE,
  })

  const signedJwtsRepository = createRepository<StoragedJwtSchema>(
    signedJwtSchema,
    redis,
  )
  await signedJwtsRepository.createIndex()

  const revokedJwtsRepository = createRepository<StoragedJwtSchema>(
    revokedJwtSchema,
    redis,
  )
  await revokedJwtsRepository.createIndex()
}

main()
  .then()
  .catch(async (e: any) => {
    console.error(e)
  })
  .finally(async () => {
    await redis.close()
  })
