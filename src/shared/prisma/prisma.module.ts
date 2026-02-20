import { DynamicModule, Module, Provider } from '@nestjs/common'
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
} from './prisma.module-definition'
import { getPrismaEntityToken } from '@/shared/prisma/prisma.utils'
import { PRISMA_CLIENT } from '@/shared/prisma/prisma.consts'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from 'generated/prisma/client'
import { prismaTransactional } from '@transactional/prisma'

@Module({})
export class PrismaModule extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    const base = super.forRoot(options)

    const prismaClientProvider: Provider = {
      provide: PRISMA_CLIENT,
      useFactory: () => {
        const adapter = new PrismaPg(options)

        return new PrismaClient({ adapter }).$extends(prismaTransactional)
      },
    }

    const providers = [...(base.providers ?? []), prismaClientProvider]
    const exports = [...(base.exports ?? []), prismaClientProvider]

    return { ...base, providers, exports }
  }

  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const base = super.forRootAsync(options)

    const prismaClientProvider: Provider = {
      provide: PRISMA_CLIENT,
      inject: [MODULE_OPTIONS_TOKEN],
      useFactory: (options: typeof OPTIONS_TYPE) => {
        const adapter = new PrismaPg(options)

        return new PrismaClient({ adapter }).$extends(prismaTransactional)
      },
    }

    const providers = [...(base.providers ?? []), prismaClientProvider]
    const exports = [...(base.exports ?? []), prismaClientProvider]

    return { ...base, providers, exports }
  }

  static forFeature(entities: string[]): DynamicModule {
    const entityProviders: Provider[] = entities.map((entity) => ({
      provide: getPrismaEntityToken(entity),
      inject: [PRISMA_CLIENT],
      useFactory: (prismaClient: PrismaClient) => {
        return prismaClient[entity]
      },
    }))

    const module = PrismaModule
    const providers = entityProviders
    const exports = providers

    return {
      module,
      providers,
      exports,
    }
  }
}
