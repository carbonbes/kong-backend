import { ObjectLiteral, SelectQueryBuilder } from 'typeorm'

type CreateMockTypeOrmQueryBuilderOptions<T> = {
  getMany?: T[]
}

export const createMockTypeOrmQueryBuilder = <T extends ObjectLiteral>({
  getMany,
}: CreateMockTypeOrmQueryBuilderOptions<T>) => {
  return {
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    setFindOptions: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    getMany: vi.fn().mockResolvedValue(getMany),
  } as unknown as SelectQueryBuilder<T>
}
