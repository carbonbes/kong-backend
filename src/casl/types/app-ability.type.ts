import { MongoAbility } from '@casl/ability'
import { Action } from '@/casl/enums'
import { Subjects } from '@/casl/types/subjects.type'

export type AppAbility = MongoAbility<[Action, Subjects]>
