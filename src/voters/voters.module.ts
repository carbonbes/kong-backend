import { Module } from '@nestjs/common'
import { VotersService } from './voters.service'

@Module({
  providers: [VotersService],
})
export class VotersModule {}
