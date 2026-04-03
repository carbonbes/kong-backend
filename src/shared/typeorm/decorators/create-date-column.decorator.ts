import { ColumnOptions, getMetadataArgsStorage } from 'typeorm'
import { dateToUnixTransformer } from '@/shared/typeorm/transformers'

export const CreateDateColumn =
  (options: ColumnOptions = {}): PropertyDecorator =>
  (object: object, propertyName: string) => {
    getMetadataArgsStorage().columns.push({
      target: object.constructor,
      propertyName,
      mode: 'createDate',
      options: {
        transformer: dateToUnixTransformer,
        ...options,
      },
    })
  }
