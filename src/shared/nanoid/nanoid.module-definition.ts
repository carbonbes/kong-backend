import { ConfigurableModuleBuilder } from '@nestjs/common'
import { NanoidModuleOptions } from '@/shared/nanoid/types'

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<NanoidModuleOptions>()
    .setClassMethodName('register')
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
