import { Schema } from 'redis-om'
import { Inject } from '@nestjs/common'

export const getRepositoryToken = (schema: Schema) =>
  `${schema.schemaName}-repository`.toUpperCase()

export const InjectRepository = (schema: Schema) =>
  Inject(getRepositoryToken(schema))
