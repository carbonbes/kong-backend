import { faker } from '@faker-js/faker/locale/ru'

type GetAlphanumericStringOptions = {
  length?: number
}

export const getAlphanumericString = (options?: GetAlphanumericStringOptions) =>
  faker.string.alphanumeric(options)
