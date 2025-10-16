export type Uuid = ReturnType<typeof crypto.randomUUID>

export type JwtHeader = {
  alg: 'HS256'
  typ: 'JWT'
}

export type JwtPayload = {
  jti: Uuid
  sub: number
  iat: number
  exp: number
}

export type EncodedJwt = `${string}.${string}.${string}`

export type Credentials = {
  access_token: EncodedJwt
  refresh_token: EncodedJwt
}
