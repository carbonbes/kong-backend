import { ConfigurableModuleBuilder } from '@nestjs/common'
import { RedisOmModuleOptions } from './redis-om.types'

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<RedisOmModuleOptions>()
  .setClassMethodName('forRoot')
  .setExtras(
    {
      isGlobal: false,
    },
    (definition, extras) => ({
      ...definition,
      global: extras.isGlobal,
    }),
  )
  .build()
