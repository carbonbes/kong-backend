import { Inject } from '@nestjs/common'
import { Schema } from 'redis-om'
import { getRepositoryToken } from '@/redis/redis.utils'

export const InjectRepository = (schema: Schema) =>
  Inject(getRepositoryToken(schema))
