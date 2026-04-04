import { User } from '@/users/entities'
import { UserGender, UserRole } from '@/users/enums'
import { faker } from '@faker-js/faker/locale/ru'
import { getFakeInt } from '@/test/utils/getFakeInt'
import { getFakeEmail } from '@/test/utils/getFakeEmail'

type GetFakeUserOptions = Partial<User>

export const getFakeUser = ({
  id,
  email,
  name,
  gender,
  role,
  isActive,
  createdAt,
  updatedAt,
}: GetFakeUserOptions = {}): User => ({
  id: id ?? getFakeInt(),
  email: email ?? getFakeEmail(),
  name: name ?? faker.internet.username(),
  gender: gender ?? faker.helpers.enumValue(UserGender),
  role: role ?? faker.helpers.enumValue(UserRole),
  isActive: isActive ?? faker.datatype.boolean(),
  createdAt: createdAt ?? faker.date.past().getTime() / 1000,
  updatedAt: updatedAt ?? faker.date.future().getTime() / 1000,
  beforeUpdateHandle() {},
})
