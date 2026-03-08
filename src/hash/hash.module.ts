import { Module } from '@nestjs/common'
import { HashService } from './hash.service'
import { ConfigurableModuleClass } from '@/hash/hash.module-definition'

@Module({
  providers: [HashService],
  exports: [HashService],
})
export class HashModule extends ConfigurableModuleClass {}
