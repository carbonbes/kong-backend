import { Subsite } from '@/subsites/entities'
import { faker } from '@faker-js/faker/locale/ru'

type GetFakeSubsiteOptions = Partial<Subsite>

export const getFakeSubsite = ({
  id,
  name,
  createdAt,
  updatedAt,
}: GetFakeSubsiteOptions = {}): Subsite => ({
  id: id ?? faker.number.int(),
  name: name ?? faker.internet.username(),
  createdAt: createdAt ?? faker.date.past().getTime() / 1000,
  updatedAt: updatedAt ?? faker.date.future().getTime() / 1000,
  beforeUpdateHandle() {},
})
