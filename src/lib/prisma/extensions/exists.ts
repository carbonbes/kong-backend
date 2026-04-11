import { Prisma } from '@/prisma/client'

type ExistsReturn = Promise<boolean>

export const exists = Prisma.defineExtension({
  model: {
    $allModels: {
      async exists<T>(
        this: T,
        where: Prisma.Args<T, 'count'>['where'],
      ): ExistsReturn {
        const context = Prisma.getExtensionContext(this)

        return (await (context as any).count({ where })) > 0
      },
    },
  },
})
