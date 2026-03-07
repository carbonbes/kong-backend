import { Module } from '@nestjs/common'
import { ConfigurableModuleClass } from '@/bcrypt/bcrypt.module-definition'
import { BcryptService } from '@/bcrypt/bcrypt.service'

@Module({
  providers: [BcryptService],
  exports: [BcryptService],
})
export class BcryptModule extends ConfigurableModuleClass {}
