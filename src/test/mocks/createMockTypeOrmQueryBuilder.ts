import { ObjectLiteral, SelectQueryBuilder } from 'typeorm'

type CreateMockTypeOrmQueryBuilderOptions<T> = {
  getOne?: T | null
  getMany?: T[]
}

export const createMockTypeOrmQueryBuilder = <T extends ObjectLiteral>({
  getOne,
  getMany,
}: CreateMockTypeOrmQueryBuilderOptions<T>) => {
  return {
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    setFindOptions: vi.fn().mockReturnThis(),
    getOne: vi.fn().mockResolvedValue(getOne),
    getMany: vi.fn().mockResolvedValue(getMany),
  } as unknown as SelectQueryBuilder<T>
}
