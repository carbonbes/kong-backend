import { DynamicModule, Module, Provider } from '@nestjs/common'
import { PRISMA_SERVICE } from '@/prisma/prisma.consts'
import { PrismaService } from '@/prisma/prisma.service'
import { getPrismaToken } from '@/prisma/prisma.utils'
import { PrismaCoreModule } from '@/prisma/prisma-core.module'

@Module({})
export class PrismaModule {
  static forRootAsync(): DynamicModule {
    return {
      module: PrismaModule,
      imports: [PrismaCoreModule.forRootAsync()],
    }
  }

  static forFeature(entity: string): DynamicModule {
    const module = PrismaModule

    const prismaEntityProvider: Provider = {
      provide: getPrismaToken(entity),
      inject: [PRISMA_SERVICE],
      useFactory: async (prismaService: PrismaService) => {
        return prismaService[entity]
      },
    }

    const providers: Provider[] = [prismaEntityProvider]
    const exports: Provider[] = providers

    return { module, providers, exports }
  }
}
