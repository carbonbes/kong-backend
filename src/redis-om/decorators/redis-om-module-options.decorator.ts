import { Inject } from '@nestjs/common'
import { MODULE_OPTIONS_TOKEN } from '@/redis-om/redis-om.module-definition'

export const InjectRedisOmModuleOptions = () => Inject(MODULE_OPTIONS_TOKEN)
