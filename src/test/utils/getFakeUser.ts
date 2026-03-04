import { User, UserGender, UserRole } from '@/users/types'
import { faker } from '@faker-js/faker/locale/ru'
import { getFakeInt } from '@/test/utils/getFakeInt'

type GetFakeUserOptions = Partial<User>

const genders: UserGender[] = ['MALE', 'FEMALE', 'NON_BINARY', 'OTHER']
const roles: UserRole[] = ['USER', 'MODER', 'ADMIN']

export const getFakeUser = ({
  name,
  id,
  email,
  gender,
  role,
  isActive,
  createdAt,
}: GetFakeUserOptions = {}): User => ({
  name: name ?? faker.internet.username(),
  id: id ?? getFakeInt(),
  email: email ?? faker.internet.email(),
  gender: gender ?? faker.helpers.arrayElement(genders),
  role: role ?? faker.helpers.arrayElement(roles),
  isActive: isActive ?? faker.datatype.boolean(),
  createdAt: createdAt ?? faker.date.past(),
})
