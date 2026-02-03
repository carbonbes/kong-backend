import {
  DynamicModule,
  Global,
  Module,
  OnApplicationShutdown,
  Provider,
  Type,
} from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { prismaTransactional } from '@transactional/prisma'
import {
  PrismaClient,
  PrismaModuleAsyncOptions,
  PrismaModuleOptions,
  PrismaOptionsFactory,
} from '@/prisma/prisma.types'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  PRISMA_CLIENT,
  PRISMA_MODULE_ID,
  PRISMA_MODULE_OPTIONS,
} from '@/prisma/prisma.consts'
import {
  generateString,
  InjectPrismaModuleOptions,
} from '@/prisma/prisma.utils'

@Global()
@Module({})
export class PrismaCoreModule implements OnApplicationShutdown {
  constructor(
    @InjectPrismaModuleOptions()
    private readonly options: PrismaModuleOptions,
    private readonly moduleRef: ModuleRef,
  ) {}

  static forRoot(options: PrismaModuleOptions = {}): DynamicModule {
    const prismaModuleOptions = {
      provide: PRISMA_MODULE_OPTIONS,
      useValue: options,
    }

    const prismaClientProvider: Provider = {
      provide: PRISMA_CLIENT,
      useFactory: () => this.createPrismaClientFactory(options),
    }

    const providers = [prismaClientProvider, prismaModuleOptions]
    const exports = [prismaClientProvider]

    return {
      module: PrismaCoreModule,
      providers,
      exports,
    }
  }

  static forRootAsync(options: PrismaModuleAsyncOptions): DynamicModule {
    const prismaClientProvider: Provider = {
      provide: PRISMA_CLIENT,
      inject: [PRISMA_MODULE_OPTIONS],
      useFactory: (prismaOptions: PrismaModuleOptions) => {
        return this.createPrismaClientFactory(prismaOptions)
      },
    }

    const asyncProviders = this.createAsyncProviders(options)

    const providers = [
      ...asyncProviders,
      prismaClientProvider,
      {
        provide: PRISMA_MODULE_ID,
        useValue: generateString(),
      },
      ...(options.extraProviders || []),
    ]

    const exports = [prismaClientProvider]

    return {
      module: PrismaCoreModule,
      imports: options.imports,
      providers,
      exports,
    }
  }

  async onApplicationShutdown(): Promise<void> {
    const client = this.moduleRef.get<PrismaClient>(PRISMA_CLIENT)
    try {
      await client.$disconnect()
    } catch {
      // Ignore errors during shutdown
    }
  }

  private static createAsyncProviders(
    options: PrismaModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)]
    }
    const useClass = options.useClass as Type<PrismaOptionsFactory>

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ]
  }

  private static createAsyncOptionsProvider(
    options: PrismaModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: PRISMA_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    const inject = [
      (options.useClass || options.useExisting) as Type<PrismaOptionsFactory>,
    ]

    return {
      provide: PRISMA_MODULE_OPTIONS,
      useFactory: async (optionsFactory: PrismaOptionsFactory) =>
        await optionsFactory.createPrismaOptions(),
      inject,
    }
  }

  private static createPrismaClientFactory(
    options: PrismaModuleOptions,
  ): PrismaClient {
    const adapter = new PrismaPg(options)

    return new PrismaClient({ adapter }).$extends(
      prismaTransactional,
    ) as PrismaClient
  }
}
