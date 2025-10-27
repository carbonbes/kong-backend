import { Schema } from 'redis-om'

const getRepositoryToken = (schema: Schema) =>
  `${schema.schemaName}-repository`.toUpperCase()

export default getRepositoryToken
