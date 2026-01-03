import { Inject } from '@nestjs/common'
import { PRISMA_SERVICE } from '@/prisma/prisma.consts'

export const getPrismaToken = (entity: string) =>
  `PRISMA_${entity.toLowerCase()}_ENTITY`

export const InjectPrisma = () => Inject(PRISMA_SERVICE)
export const InjectPrismaEntity = (entity: string) =>
  Inject(getPrismaToken(entity))
