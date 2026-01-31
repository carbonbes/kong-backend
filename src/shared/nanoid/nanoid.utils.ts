import { Inject } from '@nestjs/common'
import { NANOID_MODULE_OPTIONS } from '@/shared/nanoid/nanoid.consts'

export const InjectNanoidModuleOptions = () => Inject(NANOID_MODULE_OPTIONS)
