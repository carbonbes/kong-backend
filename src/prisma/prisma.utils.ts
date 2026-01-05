import { Inject } from '@nestjs/common'
import { PRISMA_CLIENT } from '@/prisma/prisma.consts'

export const getPrismaEntityToken = (entity: string) =>
  `PRISMA_${entity.toUpperCase()}_ENTITY`

export const InjectPrisma = () => Inject(PRISMA_CLIENT)
export const InjectPrismaEntity = (entity: string) =>
  Inject(getPrismaEntityToken(entity))
