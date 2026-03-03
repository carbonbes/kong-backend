import { Inject } from '@nestjs/common'
import { REDIS_CLIENT } from '@/redis-om/consts'

export const InjectRedisClient = () => Inject(REDIS_CLIENT)
