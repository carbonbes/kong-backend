import { ConfigurableModuleBuilder } from '@nestjs/common'
import { RedisModuleOptions } from './types'

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<RedisModuleOptions>()
    .setClassMethodName('forRoot')
    .build()
