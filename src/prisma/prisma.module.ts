import { Global, Module } from '@nestjs/common'
import {
  TransactionModule,
  txExtension,
} from '@takeny1998/nestjs-prisma-transactional'
import { PRISMA_SERVICE } from '@/prisma/consts'
import { PrismaService } from '@/prisma/prisma.service'

@Global()
@Module({
  imports: [TransactionModule],

  providers: [
    {
      provide: PRISMA_SERVICE,
      useValue: new PrismaService().$extends(txExtension),
    },
  ],

  exports: [PRISMA_SERVICE],
})
export class PrismaModule {}
