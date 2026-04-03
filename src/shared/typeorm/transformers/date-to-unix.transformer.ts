import { ValueTransformer } from 'typeorm'

export const dateToUnixTransformer: ValueTransformer = {
  from: (value: Date) => Math.floor(value.getTime() / 1000),
  to: (value: number | undefined) => (value ? new Date(value) : undefined),
}
