import { Module } from '@nestjs/common'
import { ConfigurableModuleClass } from '@/shared/bcrypt/bcrypt.module-definition'
import { BcryptService } from '@/shared/bcrypt/bcrypt.service'

@Module({
  providers: [BcryptService],
  exports: [BcryptService],
})
export class BcryptModule extends ConfigurableModuleClass {}
