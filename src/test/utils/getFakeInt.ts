import { faker } from '@faker-js/faker/locale/ru'

export const getFakeInt = () => faker.number.int({ min: 1, max: 2147483647 })
