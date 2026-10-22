import type { CookieOptions, Response } from 'express'
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from '@/shared/consts'
import { EncodedJwt } from '@/shared/types'

interface SetJwtCookieOptions {
  response: Response
  name: typeof ACCESS_TOKEN_COOKIE_NAME | typeof REFRESH_TOKEN_COOKIE_NAME
  value: EncodedJwt
}

export const setJwtCookie = ({
  response,
  name,
  value,
}: SetJwtCookieOptions) => {
  const maxAge =
    name === 'kong_access_token'
      ? Number(process.env.ACCESS_JWT_EXPIRES_IN) * 1000
      : Number(process.env.REFRESH_JWT_EXPIRES_IN) * 1000

  const options: CookieOptions = {
    httpOnly: true,
    maxAge,
    sameSite: 'lax',
    secure: true,
  }

  response.cookie(name, value, options)
}
