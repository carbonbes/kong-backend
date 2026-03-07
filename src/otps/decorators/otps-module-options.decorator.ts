import { Inject } from '@nestjs/common'
import { MODULE_OPTIONS_TOKEN } from '@/otps/otps.module-definition'

export const InjectOtpsModuleOptions = () => Inject(MODULE_OPTIONS_TOKEN)
