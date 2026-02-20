import { Schema } from 'redis-om'

export const getRedisOmRepositoryToken = (schema: Schema) =>
  `${schema.schemaName}-repository`.toUpperCase()
