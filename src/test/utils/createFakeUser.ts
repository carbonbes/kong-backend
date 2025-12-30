import { User, UserGender } from '@/users/users.types'
import { faker } from '@faker-js/faker/locale/ru'

const genders: UserGender[] = ['MALE', 'FEMALE', 'NON_BINARY', 'OTHER']

export const createFakeUser = ({
  name,
  id,
  email,
  gender,
  isActive,
  createdAt,
}: Partial<User> = {}): User => ({
  name: name ?? faker.internet.username(),
  id: id ?? faker.number.int(),
  email: email ?? faker.internet.email(),
  gender: gender ?? faker.helpers.arrayElement(genders),
  isActive: isActive ?? faker.datatype.boolean(),
  createdAt: createdAt ?? faker.date.past(),
})
