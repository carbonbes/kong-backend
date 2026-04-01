import { ColumnOptions, getMetadataArgsStorage } from 'typeorm'

export const UpdateDateColumn =
  (options: ColumnOptions = {}): PropertyDecorator =>
  (object: object, propertyName: string) => {
    getMetadataArgsStorage().columns.push({
      target: object.constructor,
      propertyName,
      mode: 'updateDate',
      options: {
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
        transformer: {
          from: (value: Date | null) =>
            value instanceof Date ? Math.floor(value.getTime() / 1000) : value,
          to: (value: number | any) =>
            typeof value === 'number' ? new Date(value * 1000) : value,
        },
        ...options,
      },
    })
  }
