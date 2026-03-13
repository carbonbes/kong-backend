import { InferSubjects } from '@casl/ability'
import { Article, User } from '@/casl/classes'

export type Subjects = InferSubjects<typeof User | typeof Article | 'all'>
