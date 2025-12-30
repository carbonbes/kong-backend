export * from './jwt'
export * from './jwts'
export * from './uuid'

export type PublicMethods<T> = {
  [K in keyof T as T[K] extends Function ? K : never]: T[K]
}
