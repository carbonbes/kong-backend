import { Module } from '@nestjs/common'
import { ConfigurableModuleClass } from '@/shared/nanoid/nanoid.module-definition'
import { NanoidService } from '@/shared/nanoid/nanoid.service'

@Module({
  providers: [NanoidService],
  exports: [NanoidService],
})
export class NanoidModule extends ConfigurableModuleClass {}
