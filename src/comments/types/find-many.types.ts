import { FindOneOptions } from 'typeorm'
import { Comment } from '@/comments/entities'
import { Cursor, PagingResult } from 'typeorm-cursor-pagination'

export type FindManyOptions = Pick<FindOneOptions<Comment>, 'where'> &
  Partial<Pick<Cursor, 'afterCursor'>>
export type FindManyReturn = Promise<PagingResult<Comment>>
