import { Inject } from '@nestjs/common'
import { Schema } from 'redis-om'
import getRepositoryToken from '@/shared/utils/getRepositoryToken'

export const InjectRepository = (schema: Schema) =>
  Inject(getRepositoryToken(schema))
