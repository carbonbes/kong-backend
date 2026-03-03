import { Schema } from 'redis-om'
import { Inject } from '@nestjs/common'
import { getRedisOmRepositoryToken } from '@/redis-om/utils'

export const InjectRedisOmRepository = (schema: Schema) =>
  Inject(getRedisOmRepositoryToken(schema))
