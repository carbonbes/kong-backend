import { DynamicModule, Module, Provider } from '@nestjs/common'
import { getPrismaEntityToken } from '@/prisma/prisma.utils'
import { PrismaCoreModule } from '@/prisma/prisma-core.module'
import {
  PrismaClient,
  PrismaModuleAsyncOptions,
  PrismaModuleOptions,
} from '@/prisma/prisma.types'
import { PRISMA_CLIENT } from '@/prisma/prisma.consts'

@Module({})
export class PrismaModule {
  static forRoot(options?: PrismaModuleOptions): DynamicModule {
    return {
      module: PrismaModule,
      imports: [PrismaCoreModule.forRoot(options)],
    }
  }

  static forRootAsync(options: PrismaModuleAsyncOptions): DynamicModule {
    return {
      module: PrismaModule,
      imports: [PrismaCoreModule.forRootAsync(options)],
    }
  }

  static forFeature(entity: string): DynamicModule {
    const module = PrismaModule

    const prismaEntityProvider: Provider = {
      provide: getPrismaEntityToken(entity),
      inject: [PRISMA_CLIENT],
      useFactory: (prismaClient: PrismaClient) => {
        return prismaClient[entity]
      },
    }

    const providers: Provider[] = [prismaEntityProvider]
    const exports: Provider[] = providers

    return { module, providers, exports }
  }
}
