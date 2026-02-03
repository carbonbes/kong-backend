import { Schema } from 'redis-om'
import { Inject } from '@nestjs/common'
import { REDIS_CLIENT, REDIS_MODULE_OPTIONS } from '@/shared/redis/redis.consts'

export const getRepositoryToken = (schema: Schema) =>
  `${schema.schemaName}-repository`.toUpperCase()

export const InjectRepository = (schema: Schema) =>
  Inject(getRepositoryToken(schema))

export const InjectRedis = () => Inject(REDIS_CLIENT)

export const InjectRedisModuleOptions = () => Inject(REDIS_MODULE_OPTIONS)

export const generateString = (): string =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15)
