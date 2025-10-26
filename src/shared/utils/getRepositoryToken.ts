import { Schema } from 'redis-om'

const getRepositoryToken = (schema: Schema) => `${schema.schemaName}Repository`

export default getRepositoryToken
