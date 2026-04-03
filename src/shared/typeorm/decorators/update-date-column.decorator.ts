import { ColumnOptions, getMetadataArgsStorage } from 'typeorm'
import { dateToUnixTransformer } from '@/shared/typeorm/transformers'

export const UpdateDateColumn =
  (options: ColumnOptions = {}): PropertyDecorator =>
  (object: object, propertyName: string) => {
    getMetadataArgsStorage().columns.push({
      target: object.constructor,
      propertyName,
      mode: 'updateDate',
      options: {
        transformer: dateToUnixTransformer,
        ...options,
      },
    })
  }
