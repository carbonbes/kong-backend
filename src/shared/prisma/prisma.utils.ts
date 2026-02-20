export const getPrismaEntityToken = (entity: string) =>
  `PRISMA_${entity.toUpperCase()}_ENTITY`
