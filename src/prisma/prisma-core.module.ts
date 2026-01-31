import {
  DynamicModule,
  Global,
  Module,
  OnApplicationShutdown,
  Provider,
} from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { prismaTransactional } from '@transactional/prisma'
import { PrismaClient, PrismaModuleOptions } from '@/prisma/prisma.types'
import { PrismaPg } from '@prisma/adapter-pg'
import { PRISMA_CLIENT } from '@/prisma/prisma.consts'

@Global()
@Module({})
export class PrismaCoreModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  static forRootAsync({
    connectionString,
  }: PrismaModuleOptions): DynamicModule {
    const module = PrismaCoreModule

    const prismaClientProvider: Provider = {
      provide: PRISMA_CLIENT,
      useFactory: () => {
        const adapter = new PrismaPg({
          connectionString,
        })

        return new PrismaClient({ adapter }).$extends(prismaTransactional)
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
