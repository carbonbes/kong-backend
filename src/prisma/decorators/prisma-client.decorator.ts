import { Inject } from '@nestjs/common'
import { PRISMA_CLIENT } from '@/prisma/consts'

export const InjectPrismaClient = () => Inject(PRISMA_CLIENT)
