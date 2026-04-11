import { Prisma } from '@/prisma/client'

type ExistsReturn = Promise<boolean>

export const exists = Prisma.defineExtension({
  model: {
    $allModels: {
      async exists<T>(
        this: T,
        where: Prisma.Args<T, 'findFirst'>['where'],
      ): ExistsReturn {
        const context = Prisma.getExtensionContext(this)
        const result = await (context as any).count({ where })

        return result > 0
      },
    },
  },
})
