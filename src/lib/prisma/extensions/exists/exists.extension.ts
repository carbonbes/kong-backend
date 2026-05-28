import { Prisma } from '@/prisma/client'
import { ExistsOptions, ExistsReturn } from './types'

export async function exists<T>(
  this: T,
  options: ExistsOptions<T>,
): ExistsReturn {
  const context = Prisma.getExtensionContext(this)

  return (await (context as any).count(options)) > 0
}

export const existsExtension = () =>
  Prisma.defineExtension({
    name: 'exists',
    model: {
      $allModels: { exists },
    },
  })
