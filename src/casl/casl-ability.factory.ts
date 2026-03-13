import { Injectable } from '@nestjs/common'
import { User } from '@/users/types'
import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
} from '@casl/ability'
import { Action } from '@/casl/enums'
import { Subjects } from '@/casl/types'
import { Article } from '@/casl/classes'

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

    if (user.role === 'ADMIN') {
      can(Action.Manage, 'all')
    } else {
      can(Action.Read, 'all')
    }

    can(Action.Update, Article, { authorId: user.id })
    cannot(Action.Delete, Article, { status: 'PUBLISHED' })

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    })
  }
}
