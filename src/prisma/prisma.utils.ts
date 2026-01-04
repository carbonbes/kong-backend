import { Inject } from '@nestjs/common'
import { PRISMA_SERVICE } from '@/prisma/prisma.consts'

export const getPrismaEntityToken = (entity: string) =>
  `PRISMA_${entity.toUpperCase()}_ENTITY`

export const InjectPrisma = () => Inject(PRISMA_SERVICE)
export const InjectPrismaEntity = (entity: string) =>
  Inject(getPrismaEntityToken(entity))
