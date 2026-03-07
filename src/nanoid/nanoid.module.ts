import { Module } from '@nestjs/common'
import { ConfigurableModuleClass } from '@/nanoid/nanoid.module-definition'
import { NanoidService } from '@/nanoid/nanoid.service'

@Module({
  providers: [NanoidService],
  exports: [NanoidService],
})
export class NanoidModule extends ConfigurableModuleClass {}
