import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'

export abstract class BaseService<T> {
  protected constructor(protected readonly repository: Repository<T>) {}

  async create(entities: DeepPartial<T>) {
    return this.repository.save(entities)
  }

  async findOne(options: FindOneOptions<T>) {
    return this.repository.findOne(options)
  }

  async findAll(options?: FindManyOptions<T>) {
    return this.repository.find(options)
  }

  async updateOne(
    criteria: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    partialEntity: T,
  ) {
    return this.repository.update(
      criteria,
      partialEntity as QueryDeepPartialEntity<T>,
    )
  }

  async deleteOne(criteria: FindOptionsWhere<T> | FindOptionsWhere<T>[]) {
    return this.repository.delete(criteria)
  }
}
