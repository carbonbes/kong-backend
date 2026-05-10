import { DynamicModule, Module, Provider } from '@nestjs/common'
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
} from './prisma.module-definition'
import { PRISMA_CLIENT } from '@/prisma/consts'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/prisma/client'
import { pagination } from 'prisma-extension-pagination'
import { unixUpdatedAt } from '@/lib/prisma/extensions'

export const createPrismaClient = (options: typeof OPTIONS_TYPE) =>
  new PrismaClient({ adapter: new PrismaPg(options) })
    .$extends(unixUpdatedAt())
    .$extends(pagination())

@Module({})
export class PrismaModule extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    const base = super.forRoot(options)

    const prismaClientProvider: Provider = {
      provide: PRISMA_CLIENT,
      useFactory: (options: typeof OPTIONS_TYPE) => createPrismaClient(options),
      inject: [MODULE_OPTIONS_TOKEN],
    }

    const providers = [...(base.providers ?? []), prismaClientProvider]
    const exports = [...(base.exports ?? []), prismaClientProvider]

    return { ...base, providers, exports }
  }

  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const base = super.forRootAsync(options)

    const prismaClientProvider: Provider = {
      provide: PRISMA_CLIENT,
      useFactory: (options: typeof OPTIONS_TYPE) => createPrismaClient(options),
      inject: [MODULE_OPTIONS_TOKEN],
    }

    const providers = [...(base.providers ?? []), prismaClientProvider]
    const exports = [...(base.exports ?? []), prismaClientProvider]

    return { ...base, providers, exports }
  }
}
