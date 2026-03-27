import { ColumnOptions, getMetadataArgsStorage } from 'typeorm'

export const UpdateDateColumn =
  (options: ColumnOptions = {}): PropertyDecorator =>
  (object: object, propertyName: string) => {
    getMetadataArgsStorage().columns.push({
      target: object.constructor,
      propertyName: propertyName,
      mode: 'updateDate',
      options: {
        type: 'bigint',
        default: () => 'extract(epoch from now())::bigint',
        transformer: {
          from: (value: string) => Number(value),
          to: (value: number) => value,
        },
        ...options,
      },
    })
  }
