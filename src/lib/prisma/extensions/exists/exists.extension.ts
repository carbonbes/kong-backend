import { Prisma } from '@/prisma/client'
import { ExistsOptions, ExistsReturn } from './types'

function createExists() {
  return async function <T>(this: T, options: ExistsOptions<T>): ExistsReturn {
    const context = Prisma.getExtensionContext(this)

    return (await (context as any).count(options)) > 0
  }
}

export const exists = createExists()

export const existsExtension = () => {
  const exists = createExists()

  return Prisma.defineExtension({
    name: 'exists',
    model: {
      $allModels: { exists },
    },
  })
}
