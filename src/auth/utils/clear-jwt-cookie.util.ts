import type { Response } from 'express'

interface ClearJwtCookieOptions {
  response: Response
  name: string
}

export const clearJwtCookie = ({ response, name }: ClearJwtCookieOptions) => {
  response.clearCookie(name)
}
