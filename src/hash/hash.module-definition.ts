import { ConfigurableModuleBuilder } from '@nestjs/common'
import { HashModuleOptions } from './types'

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<HashModuleOptions>()
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
