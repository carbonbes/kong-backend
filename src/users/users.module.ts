import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { PrismaModule } from '@/prisma/prisma.module'

@Module({
  imports: [PrismaModule.forFeature('user')],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
