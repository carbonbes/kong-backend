import { Prisma } from '@/prisma/client'

type ExistsReturn = Promise<boolean>

export const exists = Prisma.defineExtension({
  model: {
    $allModels: {
      async exists<T>(this: T, args: Prisma.Args<T, 'count'>): ExistsReturn {
        const context = Prisma.getExtensionContext(this)

        return (await (context as any).count(args)) > 0
      },
    },
  },
})
