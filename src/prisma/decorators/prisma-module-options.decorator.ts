import { Inject } from '@nestjs/common'
import { MODULE_OPTIONS_TOKEN } from '@/prisma/prisma.module-definition'

export const InjectPrismaModuleOptions = () => Inject(MODULE_OPTIONS_TOKEN)
