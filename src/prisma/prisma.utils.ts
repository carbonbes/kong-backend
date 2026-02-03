import { Inject } from '@nestjs/common'
import { PRISMA_CLIENT, PRISMA_MODULE_OPTIONS } from '@/prisma/prisma.consts'

export const getPrismaEntityToken = (entity: string) =>
  `PRISMA_${entity.toUpperCase()}_ENTITY`

export const InjectPrisma = () => Inject(PRISMA_CLIENT)

export const InjectPrismaEntity = (entity: string) =>
  Inject(getPrismaEntityToken(entity))

export const InjectPrismaModuleOptions = () => Inject(PRISMA_MODULE_OPTIONS)

export const generateString = (): string =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15)
