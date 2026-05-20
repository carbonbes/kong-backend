import { Prisma } from '@/prisma/types'

export const parseCursor = <T>(
  value: string,
): Prisma.Args<T, 'findMany'>['cursor'] =>
  JSON.parse(Buffer.from(value, 'base64').toString('utf-8'))
