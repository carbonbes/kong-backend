import { Inject } from '@nestjs/common'
import { PRISMA_CLIENT } from './prisma.consts'
import { getPrismaEntityToken } from './prisma.utils'
import { MODULE_OPTIONS_TOKEN } from './prisma.module-definition'

export const InjectPrismaClient = () => Inject(PRISMA_CLIENT)

export const InjectPrismaEntity = (entity: string) =>
  Inject(getPrismaEntityToken(entity))

export const InjectPrismaModuleOptions = () => Inject(MODULE_OPTIONS_TOKEN)
