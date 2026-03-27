import { ColumnOptions, getMetadataArgsStorage } from 'typeorm'

export const CreateDateColumn =
  (options: ColumnOptions = {}): PropertyDecorator =>
  (object: object, propertyName: string) => {
    getMetadataArgsStorage().columns.push({
      target: object.constructor,
      propertyName: propertyName,
      mode: 'createDate',
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
