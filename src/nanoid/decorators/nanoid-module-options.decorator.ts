import { Inject } from '@nestjs/common'
import { MODULE_OPTIONS_TOKEN } from '@/nanoid/nanoid.module-definition'

export const InjectNanoidModuleOptions = () => Inject(MODULE_OPTIONS_TOKEN)
