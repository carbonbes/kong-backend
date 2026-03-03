import { ConfigurableModuleBuilder } from '@nestjs/common'
import { RedisOmModuleOptions } from './types'

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<RedisOmModuleOptions>()
  .setClassMethodName('forRoot')
  .setExtras(
    {
      isGlobal: true,
    },
    (definition, extras) => ({
      ...definition,
      global: extras.isGlobal,
    }),
  )
  .build()
