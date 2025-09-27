export enum UserGender {
  MALE = 'male',
  FEMALE = 'female',
  NON_BINARY = 'non_binary',
  OTHER = 'other',
}

export interface User {
  id: number
  name: string
  email: string
  gender: UserGender
  createdAt: Date
}
