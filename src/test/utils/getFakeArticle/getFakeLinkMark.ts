import { faker } from '@faker-js/faker/locale/ru'
import type { LinkMarkDto } from '@/articles/dtos'

type GetFakeLinkMarkOptions = Partial<LinkMarkDto['attrs']>

const linkTargets = ['_blank', '_self', '_parent', '_top']
const linkRels = ['noopener', 'noreferrer', 'nofollow']

export const getFakeLinkMark = (
  options: GetFakeLinkMarkOptions = {},
): LinkMarkDto => {
  const { href, target, rel } = options

  return {
    type: 'link',
    attrs: {
      href: href ?? faker.internet.url(),
      target: target ?? faker.helpers.arrayElement(linkTargets),
      rel: rel ?? faker.helpers.arrayElement(linkRels),
    },
  }
}
