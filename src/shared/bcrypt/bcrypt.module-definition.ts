import { ConfigurableModuleBuilder } from '@nestjs/common'
import { BcryptModuleOptions } from '@/shared/bcrypt/types'

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<BcryptModuleOptions>()
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
