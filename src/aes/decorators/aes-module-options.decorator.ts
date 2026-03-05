import { Inject } from '@nestjs/common'
import { MODULE_OPTIONS_TOKEN } from '@/aes/aes.module-definition'

export const InjectAesModuleOptions = () => Inject(MODULE_OPTIONS_TOKEN)
