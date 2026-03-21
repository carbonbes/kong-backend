import { ObjectLiteral, SelectQueryBuilder } from 'typeorm'

type CreateMockTypeOrmQueryBuilderOptions<T> = {
  getMany?: T[]
}

export const createMockTypeOrmQueryBuilder = <T extends ObjectLiteral>(
  options: CreateMockTypeOrmQueryBuilderOptions<T>,
): SelectQueryBuilder<T> => {
  const queryBuilder = {
    setFindOptions: vi.fn().mockReturnThis(),
    getMany: vi.fn().mockResolvedValue(options.getMany),
  }

  return queryBuilder as unknown as SelectQueryBuilder<T>
}
