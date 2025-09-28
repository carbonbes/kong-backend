import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { ClassConstructor, plainToInstance } from 'class-transformer'

export abstract class BaseService<T, R> {
  protected constructor(
    protected readonly repository: Repository<T>,
    protected readonly responseDto: ClassConstructor<R>,
  ) {}

  private async response(plain: T | T[]) {
    return plainToInstance(this.responseDto, plain)
  }

  async create(entities: DeepPartial<T>) {
    const plain = await this.repository.save(entities)

    return this.response(plain)
  }

  async findOne(options: FindOneOptions<T>) {
    const plain = await this.repository.findOne(options)

    return this.response(plain)
  }

  async findAll(options?: FindManyOptions<T>) {
    const plain = await this.repository.find(options)

    return this.response(plain)
  }

  async updateOne(
    criteria: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    partialEntity: T,
  ) {
    const plain = await this.repository.update(
      criteria,
      partialEntity as QueryDeepPartialEntity<T>,
    )

    return this.response(plain)
  }

  async deleteOne(criteria: FindOptionsWhere<T> | FindOptionsWhere<T>[]) {
    const plain = await this.repository.delete(criteria)

    return this.response(plain)
  }
}
