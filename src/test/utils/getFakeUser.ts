import { User, UserGender } from '@/users/users.types'
import { faker } from '@faker-js/faker/locale/ru'

type GetFakeUserOptions = Partial<User>

const genders: UserGender[] = ['MALE', 'FEMALE', 'NON_BINARY', 'OTHER']

export const getFakeUser = ({
  name,
  id,
  email,
  gender,
  isActive,
  createdAt,
}: GetFakeUserOptions = {}): User => ({
  name: name ?? faker.internet.username(),
  id: id ?? faker.number.int(),
  email: email ?? faker.internet.email(),
  gender: gender ?? faker.helpers.arrayElement(genders),
  isActive: isActive ?? faker.datatype.boolean(),
  createdAt: createdAt ?? faker.date.past(),
})
