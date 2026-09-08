import { createClient } from 'redis'
import { OPTIONS_TYPE } from '@/redis-om/redis-om.module-definition'

export const createRedisClient = async (
  options: typeof OPTIONS_TYPE,
): Promise<ReturnType<typeof createClient>> => {
  const { isGlobal, ...redisOptions } = options

  const redis = createClient(redisOptions)
  await redis.connect()

  return redis
}
