import {
  DynamicModule,
  Global,
  Module,
  OnApplicationShutdown,
  Provider,
} from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { PRISMA_SERVICE } from '@/prisma/prisma.consts'
import { PrismaService } from '@/prisma/prisma.service'
import { prismaTransactional } from '@transactional/prisma'

@Global()
@Module({})
export class PrismaCoreModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  static forRootAsync(): DynamicModule {
    const module = PrismaCoreModule

    const prismaServiceProvider: Provider = {
      provide: PRISMA_SERVICE,
      useFactory: async () => new PrismaService().$extends(prismaTransactional),
    }

    const providers: Provider[] = [prismaServiceProvider]
    const exports = providers

    return {
      module,
      providers,
      exports,
    }
  }

  onApplicationShutdown() {
    const service = this.moduleRef.get<PrismaService>(PRISMA_SERVICE)
    service.$disconnect()
  }
}
