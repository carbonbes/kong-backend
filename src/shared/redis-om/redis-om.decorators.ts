import { Schema } from 'redis-om'
import { getRedisOmRepositoryToken } from './redis-om.utils'
import { Inject } from '@nestjs/common'
import { REDIS_CLIENT } from './redis-om.consts'
import { MODULE_OPTIONS_TOKEN } from './redis-om.module-definition'

export const InjectRedisOmRepository = (schema: Schema) =>
  Inject(getRedisOmRepositoryToken(schema))

export const InjectRedisClient = () => Inject(REDIS_CLIENT)

export const InjectRedisOmModuleOptions = () => Inject(MODULE_OPTIONS_TOKEN)
