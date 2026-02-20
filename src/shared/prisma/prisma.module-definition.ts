import { ConfigurableModuleBuilder } from '@nestjs/common'
import { PrismaModuleOptions } from '@/shared/prisma/prisma.types'

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<PrismaModuleOptions>()
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
