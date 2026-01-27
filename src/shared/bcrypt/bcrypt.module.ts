import { DynamicModule, Module, Provider } from '@nestjs/common'
import { BcryptService } from './bcrypt.service'
import { BcryptModuleAsyncOptions } from '@/shared/bcrypt/bcrypt.types'
import { BCRYPT_MODULE_OPTIONS } from '@/shared/bcrypt/bcrypt.consts'

@Module({})
export class BcryptModule {
  static registerAsync(options: BcryptModuleAsyncOptions): DynamicModule {
    const module = BcryptModule

    const providers: Provider[] = [
      BcryptService,
      {
        provide: BCRYPT_MODULE_OPTIONS,
        inject: options.inject,
        useFactory: options.useFactory,
      },
    ]

    const exports: Provider[] = [BcryptService]

    return {
      module,
      providers,
      exports,
    }
  }
}
