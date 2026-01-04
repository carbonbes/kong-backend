import {
  DynamicModule,
  Global,
  Module,
  OnApplicationShutdown,
  Provider,
} from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { prismaTransactional } from '@transactional/prisma'
import { PrismaModuleOptions } from '@/prisma/prisma.types'
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { PRISMA_CLIENT } from '@/prisma/prisma.consts'

@Global()
@Module({})
export class PrismaCoreModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  static forRootAsync(options: PrismaModuleOptions): DynamicModule {
    const module = PrismaCoreModule

    const prismaClientProvider: Provider = {
      provide: PRISMA_CLIENT,
      useFactory: async () => {
        const prismaClient = new PrismaClient({
          adapter: new PrismaPg(options),
        })

        return prismaClient.$extends(prismaTransactional)
      },
    }

    const providers: Provider[] = [prismaClientProvider]
    const exports = providers

    return {
      module,
      providers,
      exports,
    }
  }

  onApplicationShutdown() {
    const client = this.moduleRef.get<PrismaClient>(PRISMA_CLIENT)
    client.$disconnect()
  }
}
