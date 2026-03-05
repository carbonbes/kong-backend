import { Module } from '@nestjs/common'
import { AesService } from './aes.service'
import { ConfigurableModuleClass } from '@/aes/aes.module-definition'

@Module({
  providers: [AesService],
  exports: [AesService],
})
export class AesModule extends ConfigurableModuleClass {}
