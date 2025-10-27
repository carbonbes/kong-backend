import { Global, Module } from '@nestjs/common'
import { PRISMA_SERVICE } from '@/prisma/consts'
import { PrismaService } from '@/prisma/prisma.service'
import { prismaTransactional } from '@transactional/prisma'

@Global()
@Module({
  providers: [
    {
      provide: PRISMA_SERVICE,
      useValue: new PrismaService().$extends(prismaTransactional),
    },
  ],

  exports: [PRISMA_SERVICE],
})
export class PrismaModule {}
