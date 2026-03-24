import { Comment } from '@/comments/entities'
import { FindOptionsWhere } from 'typeorm'

export type FindAllOptions = FindOptionsWhere<Comment>
export type FindAllReturn = Promise<Comment[]>
