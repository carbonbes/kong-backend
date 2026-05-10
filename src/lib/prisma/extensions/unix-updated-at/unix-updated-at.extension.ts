import { Prisma } from '@/prisma/client'
import { UnixUpdatedAtOptions } from './types'

const getUnixTimestamp = () => Math.floor(Date.now() / 1000)

export const unixUpdatedAt = (options: UnixUpdatedAtOptions = {}) => {
  const { fieldName = 'updatedAt', models } = options

  return Prisma.defineExtension({
    name: 'unix-updated-at',
    query: {
      $allModels: {
        update: async ({ args, model, query }) => {
          if (models && !models.includes(model)) return

          args.data = {
            ...args.data,
            [fieldName]: getUnixTimestamp(),
          }

          return query(args)
        },
      },
    },
  })
}
