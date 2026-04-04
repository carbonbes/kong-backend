import { Module } from '@nestjs/common'
import { SubsitesService } from './subsites.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Subsite } from '@/subsites/entities'

@Module({
  imports: [TypeOrmModule.forFeature([Subsite])],
  providers: [SubsitesService],
})
export class SubsitesModule {}
