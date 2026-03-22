import { FindManyOptions as _FindManyOptions } from 'typeorm'
import { Comment } from '@/comments/entities'

export type FindManyOptions = _FindManyOptions<Comment>
export type FindManyReturn = Promise<Comment[]>
