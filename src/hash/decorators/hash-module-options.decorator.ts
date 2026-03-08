import { Inject } from '@nestjs/common'
import { MODULE_OPTIONS_TOKEN } from '@/hash/hash.module-definition'

export const InjectHashModuleOptions = () => Inject(MODULE_OPTIONS_TOKEN)
