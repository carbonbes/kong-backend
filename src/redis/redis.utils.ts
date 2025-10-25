import { Schema } from 'redis-om'

export const getRepositoryToken = (schema: Schema) =>
  `${schema.schemaName}Repository`
